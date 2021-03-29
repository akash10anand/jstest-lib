const { group, test, step, runGroups } = require('../src/jstest');
const util = require('util');
const { ok } = require('assert');

const sleep = util.promisify(setTimeout);

group("my group 1", {
    before: async () => {
        await sleep(1000);
        console.log("in before");
    },
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
            ok(1===1)
        })
    ],
    after: async () => {
        await sleep(1000);
        console.log("in after");
    }

})

group("my group 2", {
    before: [
        {
            
        }
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
            ok(1===1)
        }),

        test("inner test 2.3", async () => {
            await step("step 1", async () => {
                await sleep(2000);
            });
            await step("step 2", async () => {
                await sleep(1600);
            });

            ok(1===1)
        }, {parallel: false})
    ],
    after: async () => {
        await sleep(1000);
        console.log("in after");
    }

});

runGroups();