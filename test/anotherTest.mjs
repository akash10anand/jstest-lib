/**
 * This is an example of ES6 type usage of the Test-library.
 */

import { group, test, step, before, beforeEach, afterEach, after, runGroups } from '../src/jstest.js';
import { promisify } from 'util';
import { ok } from 'assert';

const sleep = promisify(setTimeout);

group("A basic group of tests", {
    tests: [
        test("inner test 1", async (t) => {
            await sleep(1000);
        }, {
            skip: false,
            retry: 2,
            parallel: true
        }),

        test("inner test 2", async (t) => {
            await sleep(1000);
            ok(1 === 1)
        })
    ]

})
runGroups();