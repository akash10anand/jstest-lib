//@ts-check

/**
 * This is an example of ES6 type usage of the Test-library.
 */

import { group, step, runGroups } from '../src/jstest.js';
import { promisify } from 'util';
import { ok } from 'assert';

const sleep = promisify(setTimeout);

group("A basic group of tests", (t) => {
    t.before("before function", async () => {
        await sleep(1000);
        ok(1==1);
    });

    t.beforeEach("before each", async () => {
        await sleep(1000);
        ok(1 === 1)
    });

    t.test("test 1", async () => {
        await sleep(1000);
        ok(1 === 1)
    }).options({
        skip: false,
        parallel: true
    });

    t.test("test 2", async (t)=>{
        await step("wait for 2 secs", async ()=>{
            await sleep(2000);
        })
        step("assert that 1 is 1", () => {
            ok( 1===1 )
        });
    }).tag(['tag1', 'tag2']);

}).options({
    retry:2,
    timeout:5000
})

group("A group of tests with hooks and tests with steps", (t) => {
    t.before("the first before", async () => {
        await sleep(1000);
        console.log("db connection created.");
    }).options({
        parallel: true
    });

    t.test("test 1", async () => {
        await sleep(1000);
    }).options({
        skip: true,
        reasonToSkip: "known failure",
        retry: 2
    });

    t.test("test 2", async () => {
        await sleep(1000);
        ok(1 == 1);
    });

    t.after("this will run after all the test have completed.", async () => {
        await sleep(1000);
    })
}).options({
    retry: 2
})

runGroups();