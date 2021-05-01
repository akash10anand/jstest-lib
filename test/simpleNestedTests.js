const { group, step, runGroups } = require('../src/jstest');
const util = require('util');
const { ok } = require('assert');

const sleep = util.promisify(setTimeout);

group("A basic group of tests", (t) => {
    t.test("test 1", async (t) => {
        ok(1==1);
    });
    
    t.test("inner test 2", async () => {
        await sleep(1000);
        ok(1 === 1)
    });
})

group("A group of tests with hooks and tests with steps", (t) => {
    t.before("the first before", async (x) => {
        await sleep(1000);
        x.context['name'] = "akash";
        console.log("db connection created.");
    }).options({
        parallel: true
    });

    t.test("test 1", async (x) => {
        ok(1 == 1);
        console.log(x.context);
    });
    
    t.test("test should be skipped", async (t) => {
        await sleep(1000);
        
    }).options({
        skip: true,
        reasonToSkip: "known failure",
        retry: 2
    });

    t.test("test 2", async (x) => {
        await sleep(1000);
        ok(1 == 1);
    });

    t.afterEach("this will run after each test", (x)=>{
        console.log(x.current_test.desc, "3=======")
    })

    t.after("this will run after all the test have completed.", async (x) => {
        await sleep(1000);
    })
}).options({
    retry: 2
})

runGroups();