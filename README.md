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
import t from "jstest-lib";
import util from "util";

const sleep = util.promisify(setTimeout);

t.group("group 1", {
    before: [
        t.before("Initiating some before action", async () => {
            await sleep(2000);
        })
    ],
    tests: [
        t.test("test1", async () => {
            await sleep(2000);
        }, { 
            parallel: false 
        }),
        
        t.test("test2", async () => {
            await sleep(2000);
        })
    ],
    after: [
        t.after("Some teardown action", async () => {
            await sleep(2000);
        })
    ]
})
t.runGroups();
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


Run Tests using  npm run test
