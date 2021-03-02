const { test } = require('../src/jstest');

test("level 1", async () => {
    test("level 2", async ()=>{
        console.log("hii");
    });
});