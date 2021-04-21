//@ts-check

const { status, result, hooks } = require("./constants");
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
         * @type {Hook|Hook[]}
         */
        this.before = null;
        /**
         * @type {Hook|Hook[]}
         */
        this.beforeEach = null;
        /**
         * @type {(Test[])}
         */
        this.tests = null;
        /**
         * @type {Test[]}
         */
        this.parallelTests = null;
        /**
         * @type {Test[]}
         */
        this.serialTests = null;
        /**
         * @type {Hook|Hook[]}
         */
        this.afterEach = null;
        /**
         * @type {Hook|Hook[]}
         */
        this.after = null;
        this.options = {
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
        this._status = status.NOTSTARTED
    }

    set status(value){
        this._status = value;
        emitter.emit('GROUP_STATUS_CHANGED', this);
    }

    async runParallel() {
        let tasks = this.parallelTests.map(async (test, index) => {
            test.status = status.STARTED
            if (test.options.skip === true) {
                // TEST SKIPPED
                this.stats.skip++;
                // console.log("SKIPPED: ", test.desc);
                test.status = status.COMPLETED;
                test.result = result.SKIPPED;
            } else {
                try {
                    try {
                        await this.runHooks(this.beforeEach);
                    } catch (error) {
                        throw error;
                    }
                    await test.fn(this);
                    // TEST PASSED
                    this.stats.pass++;
                    test.status = status.COMPLETED;
                    test.result = result.PASSED;
                    await this.runHooks(this.afterEach);
                } catch (error) {
                    if (error.name === AssertionError.name) {
                        // TEST FAILED due to Assertion failure
                        this.stats.fail++;
                        test.status = status.COMPLETED;
                        test.result = result.FAILED;
                        console.log(error);
                    }
                    else {
                        // TEST ERROR due to some other error
                        this.stats.error++;
                        test.status = status.COMPLETED;
                        test.result = result.ERROR;
                        console.log(error);
                    }
                }
            }

        });
        await Promise.all(tasks);
        emitter.emit('PARALLEL_TESTS_COMPLETED', this)
    };

    async runSerial() {
        for (var index = 0; index < this.serialTests.length; index++) {
            var test = this.serialTests[index];
            test.status = status.STARTED
            if (test.options.skip === true) {
                // TEST SKIPED
                this.stats.skip++;
                console.log("SKIPPED: ", test.desc);
                test.status = status.COMPLETED;
                test.result = result.SKIPPED;
            } else {
                if (test.fn.toString().startsWith("async")) {
                    await this.runHooks(this.beforeEach)
                    await test.fn(this);
                    test.result = result.PASSED
                    test.status = status.COMPLETED
                    await this.runHooks(this.afterEach);
                } else {
                    throw ("Not an async function");
                }
            }
        }
        emitter.emit('SERIAL_TESTS_COMPLETED', this);
    };

    async run() {
        this.status = status.STARTED;
        await this.runHooks(this.before);
        this.parallelTests = this.tests.filter(t => t.options.parallel === true);
        this.serialTests = this.tests.filter(t => t.options.parallel === false);
        const startTime = Date.now();
        // Run the parallel tests first.
        console.log("Tests started at: ", new Date());
        if (this.options.parallel) {
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
        this.runHooks(this.after);
        this.status = status.COMPLETED;
        const totalTime = Date.now() - startTime;
        console.log(`Total time taken: ${Number((totalTime / 1000).toFixed(2))} secs`)

    }

    /**
     * @param  {Hook|Hook[]} hooks
     */
    async runHooks(hooks) {
        if (Array.isArray(hooks) && hooks.length > 0) {
            let parallelHooks = hooks.filter(t => t.options.parallel === true);
            let serialHooks = hooks.filter(t => t.options.parallel === false);
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
                E.status = status.STARTED
                if (E.options.skip === true) {
                    // ENTITY SKIPED
                    this.stats.skip++;
                    console.log("SKIPPED: ", E.desc);
                    E.status = status.COMPLETED;
                    E.result = result.SKIPPED;
                } else {
                    try {
                        await E.fn(this);
                        console.log("✅", E.desc);
                    } catch (error) {
                        console.log("❗", E.desc);
                        console.log(error);
                    }
                }
            });
            await Promise.all(tasks);
        }
    };

    async runHooksInSerial(hooks) {
        if (Array.isArray(hooks) && hooks.length > 0) {
            for (var index = 0; index < this.serialTests.length; index++) {
                var E = hooks[index];
                if (E.fn.toString().startsWith("async")) {
                    E.status = status.STARTED
                    await E.fn(this);
                    console.log("✅", E.desc);
                    E.result = result.PASSED;
                    E.status = status.COMPLETED;
                }
            }
        }
    };
}
class Test extends EventEmitter {
    /**
     * @param  {String} desc
     * @param  {(Function|null)} fn
     */
    constructor(desc, fn = null) {
        super();
        this.desc = desc;
        this.fn = fn;
        this._status = status.NOTSTARTED
        this._result = result.UNTESTED
        this.options = {
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
        this.emit(`TEST_${this._status}`, this)
        emitter.emit('TEST_STATUS_CHANGED', this)
    }
    /**
     * @param  {string} value
     */
    set result(value) {
        this._result = value;
        if (this._result in [result.PASSED, result.FAILED, result.SKIPPED]) {
            this._status = status.COMPLETED;
        }
        this.emit(`TEST_${this._result}`, this)
        emitter.emit('TEST_RESULT_CAME', this)
    }
}

class Hook extends EventEmitter {
    /**
     * @param  {String} desc
     * @param  {(Function|null)} fn
     */
    constructor(desc, fn = null) {
        super();
        this.desc = desc;
        this.type = '';
        this.fn = fn;
        this._result = null
        this._status = hooks.status.NOTSTARTED
        this.options = {
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
        emitter.emit(`HOOK_STATUS_CHANGED`, this);
    }
    /**
     * @param  {string} value
     */
    set result(value) {
        this._result = value;
        if (this._result in [hooks.result.DONE, hooks.result.FAILED]) {
            this._status = hooks.status.COMPLETED;
        }
        emitter.emit(`HOOK_RESULT_CAME`, this)
    }
}

module.exports = { Group, Test, Hook, emitter };