const status = {
    NOTSTARTED: "NOTSTARTED",
    STARTED: "STARTED",
    COMPLETED: "COMPLETED"
}
const result = {
    FAILED: "FAILED",
    ERROR: "ERROR",
    PASSED: "PASSED",
    SKIPPED: "SKIPPED",
    UNTESTED: "UNTESTED"
}
const hooks = {
    types: {
        BEFORE: 'before',
        BEFOREEACH: 'beforeEach',
        AFTEREACH: 'after',
        AFTER: 'after'
    },
    result: {
        DONE: 'DONE',
        FAILED: 'FAILED'
    },
    status: {
        NOTSTARTED: "NOTSTARTED",
        STARTED: "STARTED",
        COMPLETED: "COMPLETED"
    }
}

module.exports = { status, result, hooks }