//@ts-check

const { Group, Test, Hook, emitter } = require("./test");
require('./simple_console_reporter');

/**
 * @type {Group}
 */
let current_group;
let groups = [];

/**
 * Callback for adding group data.
 *
 * @callback fn
 * @param {Group} g - a Group object .
 */

/**
 * @param  {String} desc
 * @param  {fn} fn
 * @returns {Group}
 */
function group(desc, fn) {
    let _group = new Group(desc);
    current_group = _group;
    
    void async function() {
        await fn(_group);
    }();
    groups.push(current_group);
    return _group;
}

async function step(desc, cb) {
    try {
        await cb();
        console.log(`   - ${desc}`);
    } catch (error) {
        console.log(`   - Failed at this step: ${desc}`);
        throw Error(error);
    }
}

async function runGroups() {
    for (var index = 0; index < groups.length; index++) {
        var group = groups[index];
        console.log(group.desc);
        await group.run();
    }
};

module.exports = { group, step, runGroups, emitter };