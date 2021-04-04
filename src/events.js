const EventEmitter = require("events");

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

module.exports = { status, result, EventEmitter }