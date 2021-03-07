const tests = [];
const tests_serial = [];
/**
 * @param  {String} desc
 * @param  {CallableFunction} fn
 */

function test_serial(desc, fn) {
    tests_serial.push({ desc, fn });
}

function test_parallel(desc, fn) {
    if (fn.toString().startsWith("async")) {
        tests.push({ desc, fn });
    }
    else {
        throw "parallel tests should be async functions";
    }
}

async function runParallel() {
    let test_queue = [];
    tests.forEach((test) => {
        test_queue.push(test.fn);
    });
    let tasks = test_queue.map(async (test_fn, index) => {
        await test_fn();
        console.log("✅", tests[index].desc);

    });
};

async function runSerial() {
    for (var index = 0; index < tests_serial.length; index++) {
        var test = tests_serial[index];
        if (test.fn.toString().startsWith("async")) {
            await test.fn();
            console.log("✅", test.desc);
        } else {
            test.fn();
            console.log("✅", test.desc);
        }
    }
};

async function run() {
    const startTime = Date.now();
    // Run the parallel tests first.
    console.log("Tests started at: ", new Date());
    await Promise.all([runParallel(), runSerial()]);
    const totalTime = Date.now() - startTime;
    console.log(`Total time taken: ${Number((totalTime / 1000).toFixed())} ms`)
    
    
}

module.exports = { test_parallel, test_serial, run };