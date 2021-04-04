const {Test} = require('./test');

/**
 * @param  {Test} entity
 */
function report(entity) {
    
    entity.on('TEST_STARTED', (t)=>{
        console.log(`Test ${t.desc} Started`, new Date())
    })
    entity.on('TEST_COMPLETED', (t)=>{
        console.log(`Test ${t.desc} Completed`, new Date())
    })
    entity.on('TEST_PASSED', (t)=>{
        console.log(`✅ ${t.desc}`)
    })
    entity.on('TEST_SKIPPED', (t)=>{
        console.log(`SKIPPED: ${t.desc}`)
    })
    entity.on('TEST_FAILED', (t)=>{
        console.log(`❌ ${t.desc}`)
    })
    entity.on('TEST_ERROR', (t)=>{
        console.log(`❗ ${t.desc}`)
    })
}

module.exports = report;