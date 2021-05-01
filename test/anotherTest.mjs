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
    });

    t.beforeEach("before each", async () => {
        await sleep(1000);
    });

    t.test("test 1", async () => {
        await sleep(1000);
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

    t.after("after", (t)=>{
        
    })
}).options({
    retry:2,
    timeout:5000
})

runGroups();