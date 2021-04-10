const { group, test, step, before, beforeEach, afterEach, after, runGroups } = require('../src/jstest');
const util = require('util');
const { ok } = require('assert');

const sleep = util.promisify(setTimeout);

group("my group 1", {
    tests: [
        test("inner test 1", async () => {
            await sleep(1000);
        }, {
            skip: false,
            retry: 2,
            parallel: true
        }),

        test("inner test 2", async () => {
            await sleep(1000);
            ok(1 === 1)
        })
    ]

})

group("my group 2", {
    before: [
        before("the 1st before", async () => {
            await sleep(1000);
            console.log("db connection created.");
        }, { parallel: true }),

    ],
    tests: [
        test("inner test 1.2", async () => {
            await sleep(1000);
        }, {
            skip: true,
            retry: 2
        }),

        test("inner test 2.2", async () => {
            await sleep(1000);
            ok(1 === 1)
        }),

        test("inner test 2.3", async () => {
            await step("step 1", async () => {
                await sleep(2000);
            });
            await step("step 2", async () => {
                await sleep(1600);
            });

            ok(1 === 1)
        }, { parallel: true })
    ],
    after: async () => {
        await sleep(1000);
        console.log("in after");
    },
    options: {
        parallel: true
    }

});

runGroups();