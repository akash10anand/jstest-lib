//@ts-check

const { status, result, EventEmitter } = require("./events");
const { AssertionError } = require("assert")

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
         * @typedef {{desc: (String|null),
         *            fn: Function,
         *            options: BaseOptions}} Hook
         */
        /**
         * @type {Hook|Hook[]}
         */
        this.before = null;
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
        this.current_test = null;
    }

    async runParallel() {
        let tasks = this.parallelTests.map(async (test, index) => {
            test.status = status.STARTED
            if (test.options.skip === true) {
                // TEST SKIPED
                this.stats.skip++;
                console.log("SKIPPED: ", test.desc);
                test.status = status.COMPLETED;
                test.result = result.SKIPPED;
            } else {
                try {
                    await test.fn();
                    // TEST PASSED
                    this.stats.pass++;
                    test.status = status.COMPLETED;
                    test.result = result.PASSED;
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
            }else{
                if (test.fn.toString().startsWith("async")) {
                    await test.fn();
                    console.log("✅", test.desc);
                    test.result = result.PASSED
                    test.status = status.COMPLETED
                }else{
                    throw("Not an async function");
                }
            }
        }
    };

    async run() {
        await this.runEntity('before');
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

        const totalTime = Date.now() - startTime;
        console.log(`Total time taken: ${Number((totalTime / 1000).toFixed(2))} secs`)

    }
    /**
     * @param  {('before'|'beforeEach'|'afterEach'|'after')} entityType
     */
    async runEntity(entityType) {
        switch (entityType) {
            case 'before':
                if (Array.isArray(this.before)) {
                    let parallelBefore = this.before.filter(t => t.options.parallel === true);
                    let serialBefore = this.before.filter(t => t.options.parallel === false);
                    // run the parallel objects
                    await this.runEntitiesInParallel(parallelBefore);
                    // run the serial objects
                    await this.runEntitiesInSerial(serialBefore);
                }
                else {
                    // before is not array, it is single object
                }
                break;
            case 'beforeEach':
                if (Array.isArray(this.beforeEach)) {
                    // run the parallel objects

                    // run the serial objects
                }
                else {
                    // before is not array, it is single object
                }
                break;
            case 'afterEach':
                if (Array.isArray(this.before)) {
                    // run the parallel objects

                    // run the serial objects
                }
                else {
                    // before is not array, it is single object
                }
                break;
            case 'after':
                if (Array.isArray(this.before)) {
                    // run the parallel objects

                    // run the serial objects
                }
                else {
                    // before is not array, it is single object
                }
                break;
        }
    }

    async runEntitiesInParallel(entity) {
        let tasks = entity.map(async (E, index) => {
            E.status = status.STARTED
            if (E.options.skip === true) {
                // ENTITY SKIPED
                this.stats.skip++;
                console.log("SKIPPED: ", E.desc);
                E.status = status.COMPLETED;
                E.result = result.SKIPPED;
            } else {
                try {
                    await E.fn();
                    console.log("✅", E.desc);
                } catch (error) {
                        console.log("❗", E.desc);
                        console.log(error);
                    }
                }
            });
        await Promise.all(tasks);
    };

    async runEntitiesInSerial(entity) {
        for (var index = 0; index < this.serialTests.length; index++) {
            var E = entity[index];
            if (E.fn.toString().startsWith("async")) {
                E.status = status.STARTED
                await E.fn();
                console.log("✅", E.desc);
                E.result = result.PASSED;
                E.status = status.COMPLETED;
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
    set status(value) {
        this._status = value;
        this.emit(`TEST_${this.status}`, this)
    }
    set result(value) {
        this._result = value;
        if (this._result in [result.PASSED, result.FAILED, result.SKIPPED]) {
            this._status = status.COMPLETED;
        }
        this.emit(`TEST_${this._result}`, this)
    }
}

module.exports = { Group, Test };