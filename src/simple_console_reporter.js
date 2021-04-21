//@ts-check
/**
 * This is a simple report.
 * Reports use events from tests so later we can use these as plugins.
 */

const {emitter} = require('./test');

console.log("reporter registered");

emitter.on('GROUP_STATUS_CHANGED', (group) => {
    console.log(`${group.desc} - ${group._status}`)
})

emitter.on('TEST_STATUS_CHANGED', (test) => {
    console.log(`${test.desc} - ${test._status}`)
})

emitter.on('TEST_RESULT_CAME', (test) => {
    if(test._result === 'PASSED'){
        console.log(`✅ ${test.desc}`)
    }
    else if(test._result === 'SKIPPED'){
        console.log(`SKIPPED: ${test.desc}`)
    }
    else if(test._result === 'FAILED'){
        console.log(`❌ ${test.desc}`)
    }
    else if(test._result === 'ERROR'){
        console.log(`❗ ${test.desc}`)
    }
})
