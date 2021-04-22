//@ts-check

const constants = require("./constants");
const { AssertionError } = require("assert")
const EventEmitter = require("events");

const emitter = new EventEmitter();

/**
* @typedef {{reasonToSkip: string,
*            parallel: boolean,
*            skipInCi: boolean,
*            onlyInCi: boolean,
*            timeout: number,
*            retry: number}} BaseOptions
*/

class Group {
    /**
     * @param  {String} desc
     */
    constructor(desc) {
        /**
         * @type {string}
         */
        this.desc = desc;
        /**
         * @type {Hook[]}
         */
        this._before = [];
        /**
         * @type {Hook[]}
         */
        this._beforeEach = [];
        /**
         * @type {(Test[])}
         */
        this._tests = [];
        /**
         * @type {Test[]}
         */
        this._parallelTests = [];
        /**
         * @type {Test[]}
         */
        this._serialTests = [];
        /**
         * @type {Hook[]}
         */
        this._afterEach = [];
        /**
         * @type {Hook[]}
         */
        this._after = [];
        this._options = {
            skip: false,
            reasonToSkip: '',
            parallel: false,
            skipInCi: false,
            onlyInCi: false,
            timeout: Infinity,
            retry: 0
        };
        this.stats = {
            pass: 0,
            fail: 0,
            skip: 0,
            error: 0
        }
        /**
         * @type {Test}
         */
        this.current_test = null;
        this._status = constants.status.NOTSTARTED
    }

    options({skip=false, reasonToSkip=undefined, parallel=true, skipInCi=false, onlyInCi=false, timeout=Infinity, retry=0, todo=false}={}){
        this._options = {skip, reasonToSkip, parallel, skipInCi, onlyInCi, timeout, retry, todo};
    }

    /**
     * @param {string} value
     */
    set status(value) {
        this._status = value;
        emitter.emit('GROUP_STATUS_CHANGED', this);
    }

    /**
     * @param {Function} [fn]
     */
    before(desc='', fn) {
        let hook = new Hook(desc, fn);
        hook.type = constants.hooks.types.BEFORE;
        this._before.push(hook);
        return hook;
    };
    /**
     * @param {Function} fn
     */
    beforeEach(desc='', fn) {
        let hook = new Hook(desc, fn);
        hook.type = constants.hooks.types.BEFOREEACH;
        this._beforeEach.push(hook);
        return hook;
    };
    /**
     * @param {Function} fn
     */
    afterEach(desc='', fn) {
        let hook = new Hook(desc, fn);
        hook.type = constants.hooks.types.AFTEREACH;
        this._afterEach.push(hook);
        return hook;
    };
    /**
     * @param {Function} fn
     */
    after(desc='', fn) {
        let hook = new Hook(desc, fn);
        hook.type = constants.hooks.types.AFTER;
        this._after.push(hook);
        return hook;
    };
    /**
     * A callback which will be called when test runs
     * @callback callBack
     * @param {Group} g
     */
    /**
     * @param {string} desc
     * @param {callBack} fn
     */
    test(desc, fn) {
        let t = new Test(desc, fn);
        this._tests.push(t);
        return t;
    }

    async runParallel() {
        let tasks = this._parallelTests.map(async (test, index) => {
            test.status = constants.status.STARTED
            if (test._options.skip === true) {
                // TEST SKIPPED
                this.stats.skip++;
                // console.log("SKIPPED: ", test.desc);
                test.result = constants.result.SKIPPED;
            } else {
                try {
                    try {
                        await this.runHooks(this._beforeEach);
                    } catch (error) {
                        throw error;
                    }
                    await test.fn(this);
                    // TEST PASSED
                    this.stats.pass++;
                    test.result = constants.result.PASSED;
                    await this.runHooks(this._afterEach);
                } catch (error) {
                    if (error.name === AssertionError.name) {
                        // TEST FAILED due to Assertion failure
                        this.stats.fail++;
                        test.result = constants.result.FAILED;
                        console.log(error);
                    }
                    else {
                        // TEST ERROR due to some other error
                        this.stats.error++;
                        test.result = constants.result.ERROR;
                        console.log(error);
                    }
                }
            }

        });
        await Promise.all(tasks);
        emitter.emit('PARALLEL_TESTS_COMPLETED', this)
    };

    async runSerial() {
        for (var index = 0; index < this._serialTests.length; index++) {
            var test = this._serialTests[index];
            test.status = constants.status.STARTED
            if (test._options.skip === true) {
                // TEST SKIPED
                this.stats.skip++;
                console.log("SKIPPED: ", test.desc);
                test.result = constants.result.SKIPPED;
            } else {
                if (test.fn.toString().startsWith("async")) {
                    await this.runHooks(this._beforeEach)
                    await test.fn(this);
                    test.result = constants.result.PASSED
                    await this.runHooks(this._afterEach);
                } else {
                    throw ("Not an async function");
                }
            }
        }
        emitter.emit('SERIAL_TESTS_COMPLETED', this);
    };

    async run() {
        this.status = constants.status.STARTED;
        await this.runHooks(this._before);
        this._parallelTests = this._tests.filter(t => t._options.parallel === true);
        this._serialTests = this._tests.filter(t => t._options.parallel === false);
        const startTime = Date.now();
        // Run the parallel tests first.
        console.log("Tests started at: ", new Date());
        if (this._options.parallel) {
            await Promise.all([this.runParallel(), this.runSerial()]);
        } else {
            // First the parallel tests will run and then the serial tests.
            try {
                await this.runParallel();
            } catch (error) {
                console.log(error)
            }
            try {
                await this.runSerial();
            } catch (error) {
                console.log(error)
            }

        }
        await this.runHooks(this._after);
        this.status = constants.status.COMPLETED;
        const totalTime = Date.now() - startTime;
        console.log(`Total time taken: ${Number((totalTime / 1000).toFixed(2))} secs`)

    }

    /**
     * @param  {Hook|Hook[]} hooks
     */
    async runHooks(hooks) {
        if (Array.isArray(hooks) && hooks.length > 0) {
            let parallelHooks = hooks.filter(t => t._options.parallel === true);
            let serialHooks = hooks.filter(t => t._options.parallel === false);
            // run the parallel objects
            await this.runHooksInParallel(parallelHooks);
            // run the serial objects
            await this.runHooksInSerial(serialHooks);
        }
        else {
            // before is not array, it is single object
        }
    }


    /**
     * @param  {Hook|Hook[]} hooks
     */
    async runHooksInParallel(hooks) {
        if (Array.isArray(hooks) && hooks.length > 0) {
            let tasks = hooks.map(async (E, index) => {
                E.status = constants.status.STARTED
                if (E._options.skip === true) {
                    // ENTITY SKIPED
                    this.stats.skip++;
                    console.log("SKIPPED: ", E.desc);
                    E.result = constants.result.SKIPPED;
                } else {
                    try {
                        await E.fn(this);
                        console.log("✅", E.desc);
                        E.result = constants.hooks.result.DONE
                    } catch (error) {
                        console.log("❗", E.desc);
                        E.result = constants.hooks.result.DONE
                        console.log(error);
                    }
                }
            });
            await Promise.all(tasks);
        }
    };

    /**
     * @param {Hook[]} hooks
     */
    async runHooksInSerial(hooks) {
        if (Array.isArray(hooks) && hooks.length > 0) {
            for (var index = 0; index < this._serialTests.length; index++) {
                var E = hooks[index];
                try {
                    await E.fn(this);
                    console.log("✅", E.desc);
                    E.result = constants.hooks.result.DONE
                } catch (error) {
                    console.log("❗", E.desc);
                    E.result = constants.hooks.result.DONE
                    console.log(error);
                }
            }
        }
    };
}
class Test {
    /**
     * @param  {String} desc
     * @param  {(Function|null)} fn
     */
    constructor(desc, fn = null) {
        this.desc = desc;
        this.fn = fn;
        this._status = constants.status.NOTSTARTED
        this._result = constants.result.UNTESTED
        this._options = {
            skip: false,
            reasonToSkip: undefined,
            parallel: true,
            skipInCi: false,
            onlyInCi: false,
            timeout: Infinity,
            retry: 0,
            todo: false,
        }
    }
    /**
     * @param  {string} value
     */
    set status(value) {
        this._status = value;
        emitter.emit('TEST_STATUS_CHANGED', this)
    }
    /**
     * @param  {string} value
     */
    set result(value) {
        this._result = value;

        // If result of Test is ERROR, then it was STARTED, but did not COMPLETE, so we are skipping it in the below array. 
        if ([constants.result.PASSED, constants.result.FAILED, constants.result.SKIPPED].includes(value)) {
            this.status = constants.status.COMPLETED;
        }
        emitter.emit('TEST_RESULT_CAME', this)
    }

    options({skip=false, reasonToSkip=undefined, parallel=true, skipInCi=false, onlyInCi=false, timeout=Infinity, retry=0, todo=false}={}){
        this._options = {skip, reasonToSkip, parallel, skipInCi, onlyInCi, timeout, retry, todo};
    }
}

class Hook {
    /**
     * @param  {String} desc
     * @param  {(Function|null)} fn
     */
    constructor(desc, fn = null) {
        this.desc = desc;
        this.type = '';
        this.fn = fn;
        this._result = null
        this._status = constants.hooks.status.NOTSTARTED
        this._options = {
            skip: false,
            reasonToSkip: undefined,
            parallel: true,
            skipInCi: false,
            onlyInCi: false,
            timeout: Infinity,
            retry: 0,
        }
    }
    
    /**
     * @param  {string} value
     */
    set status(value) {
        this._status = value;
        emitter.emit("HOOK_STATUS_CHANGED", this);
    }
    /**
     * @param  {string} value
     */
    set result(value) {
        this._result = value;
        
        // If result of Hook is FAILED, then it was STARTED, but did not COMPLETE, so we are skipping it in the below array. 
        if ([constants.hooks.result.DONE, constants.hooks.result.SKIPPED].includes(value)) {
            this.status = constants.hooks.status.COMPLETED;
        }
        emitter.emit("HOOK_RESULT_CAME", this)
    }
    options({skip=false, reasonToSkip=undefined, parallel=true, skipInCi=false, onlyInCi=false, timeout=Infinity, retry=0, todo=false}={}){
        this._options = {skip, reasonToSkip, parallel, skipInCi, onlyInCi, timeout, retry, todo};
    }
}

module.exports = { Group, Test, Hook, emitter };