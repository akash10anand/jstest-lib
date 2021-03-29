const EventEmitter = require("events");

const status = {
    NOTSTARTED: "NOTSTARTED", 
    STARTED: "STARTED",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
    ERROR: "ERROR",
    PASSED: "PASSED",
    SKIPPED: "SKIPPED"
}

module.exports = {status, EventEmitter}