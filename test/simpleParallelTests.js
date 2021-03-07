const { test_parallel, run, test_serial } = require('../src/jstest_exp');
const util = require('util');

const sleep = util.promisify(setTimeout);

test_parallel("test 1", async () => {
    await sleep(2000);
    console.log(new Date());
});

test_parallel("test 2", async () => {
    await sleep(1000);
    console.log(new Date());
});

test_serial("test 3", async () => {
    await sleep(2000);
    console.log(new Date());
});

test_serial("test 4", async () => {
    await sleep(1000);
    console.log(new Date());
});

// test_serial("test 5", async () => {
//     test_serial("test inner 1", async () => {
//         await sleep(1000);
//         console.log(new Date());
//     });
//     test_serial("test inner 2", async () => {
//         await sleep(1000);
//         console.log(new Date());
//     });
//     // run();
// })

run();
