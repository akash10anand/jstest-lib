const { group, test, step, before, beforeEach, afterEach, after, runGroups } = require('../src/jstest');
const util = require('util');
const { ok } = require('assert');

const sleep = util.promisify(setTimeout);

group("A basic group of tests", {
    tests: [
        test("inner test 1", async (t) => {
            await sleep(1000);
            console.log(t)
        }, {
            skip: false,
            retry: 2,
            parallel: true
        }),

        test("inner test 2", async (t) => {
            await sleep(1000);
            console.log(t);
            ok(1 === 1)
        })
    ]

})

group("A group of tests with hooks and tests with steps", {
    before: [
        before("the 1st before", async () => {
            await sleep(1000);
            console.log("db connection created.");
        }, { parallel: true }),

    ],
    tests: [
        test("test 1", async () => {
            await sleep(1000);
        }, {
            skip: true,
            retry: 2
        }),

        test("test 2", async () => {
            await sleep(1000);
            ok(1 === 1)
        }),

        test("test 3", async () => {
            await step("step 1", async () => {
                await sleep(2000);
            });
            await step("step 2", async () => {
                await sleep(1600);
            });

            ok(1 === 1)
        }, { parallel: true })
    ],
    after: [
        after("this should run after all tests are done", async () => {
            await sleep(1000);
        })
    ],

    options: {
        parallel: true
    }

});

runGroups();