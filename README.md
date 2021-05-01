## jstest-lib

jstest-lib is a simple testing library for Nodejs. More focus is on integration tests where multiple tests can be run conurrently and with the goodness of configurations.

------------


#### Features:
- Tests can be run in Parallel (concurrent) as well as in Sequencial manner as per config.
- Even the hooks (Before, After, BeforeEach, AfterEach) can run in parallel or in sequence.
- Tests are simply as just any other application code
- No fancy DSL
- No prebuilt assertions. You can use Nodejs assertions or any assertion libraries you want.

------------


#### Usage:
```javascript
import { group, step, runGroups } from 'jstest-lib';
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
```


------------

###### Options that can be passed to a Test:
- skip: boolean
- reasonToSkip: string
- parallel: boolean
- skipInCi: boolean
- onlyInCi: boolean
- timeout: number
- retry: number
- todo: boolean

------------
##### Hooks:
Before: before(desc, fn, {options}) or array of before() functions.
BeforeEach: beforeEach(desc, fn, {options}) or array of beforeEach() functions.
AfterEach: afterEach(desc, fn, {options}) or array of afterEach() functions.
After: after(desc, fn, {options}) or array of after() functions.


###### Options that can be passed to a Hook:
- parallel: boolean
- skipInCi: boolean
- onlyInCi: boolean
- timeout: number
- retry: number
- retry: number


------------

#### Run Tests using    `npm run test`
