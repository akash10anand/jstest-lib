const { status, EventEmitter } = require("./events");
const { AssertionError } = require("assert")
/**
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} Group
 * @property {String} desc 
 * @property {(Function|[Function])} before
 * @property {(Function|[Function])} beforeEach
 * @property {(Function|[Function])} before
 * @property {(Function|[Function])} beforeEach
 * @property {(Function|[Function])} before
 * @property {(Function|[Function])} beforeEach
 * 
 */
class Group {
    /**
     * @param  {String} desc
     */
    constructor(desc) {
        this.desc = desc;
        this.before = [];
        this.beforeEach = [];
        this.parallelTests = [];
        this.serialTests = [];
        this.afterEach = [];
        this.after = [];
        this.options = {};
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
            if (test.skip === true) {
                // TEST SKIPED
                this.stats.skip++;
                console.log("SKIPPED: ", test.desc);
            } else {
                try {
                    await test.fn();
                    // TEST PASSED
                    this.stats.pass++;
                    console.log("✅", test.desc);
                } catch (error) {
                    if (error.name === AssertionError.name) {
                        // TEST FAILED due to Assertion failure
                        this.stats.fail++;
                        console.log("❌", test.desc);
                        console.log(error);
                    }
                    else {
                        // TEST ERROR due to some other error
                        this.stats.error++;
                        console.log("❗", test.desc);
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
            if (test.fn.toString().startsWith("async")) {
                await test.fn();
                console.log("✅", test.desc);
            }
        }
    };

    async run() {
        const startTime = Date.now();
        // Run the parallel tests first.
        console.log("Tests started at: ", new Date());
        await this.runParallel();
        await this.runSerial();
        // await Promise.all([runParallel(), runSerial()]);
        const totalTime = Date.now() - startTime;
        console.log(`Total time taken: ${Number((totalTime / 1000).toFixed(2))} secs`)

    }
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
        this.skip = false;
        this.reasonToSkip;
        this.parallel = true;
        this.skipInCi = false;
        this.onlyInCi = false;
        this.timeout = Infinity;
        this.retry = 0;
        this.todo = false;
        this.status = status.NOTSTARTED
    }
}

module.exports = { Group, Test };