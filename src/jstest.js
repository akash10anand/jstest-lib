//@ts-check

const { hooks } = require("./constants");
const report = require("./report");
const { Group, Test, Hook } = require("./test");


/**
 * @type {Group}
 */
let current_group;
let groups = [];

/**
* @typedef {{reasonToSkip: string,
*            parallel: boolean,
*            skipInCi: boolean,
*            onlyInCi: boolean,
*            timeout: number,
*            retry: number}} BaseOptions
*/

/**
* @typedef {{skip: boolean,
*            reasonToSkip: string,
*            parallel: boolean,
*            skipInCi: boolean,
*            onlyInCi: boolean,
*            timeout: number,
*            retry: number,
*            todo: boolean}} TestOptions
*/

/**
* @typedef {{skip: boolean,
*            reasonToSkip: string,
*            parallel: boolean,
*            skipInCi: boolean,
*            onlyInCi: boolean,
*            timeout: number,
*            retry: number,
*            todo: boolean}} GroupOptions
*/

/**
* @typedef {{callBack: Function,
*            before: (Hook|Hook[]),
*            beforeEach: (Hook|Hook[]),
*            tests: Test[],
*            afterEach: (Hook|Hook[]),
*            after: (Hook|Hook[]),
*            options: GroupOptions,
*            }} detailedObject
*/

/**
 * @param  {String} desc
 * @param  {detailedObject} detailedObject
 */
function group(desc, {
    before,
    beforeEach,
    tests,
    afterEach,
    after,
    options = { skip: false, reasonToSkip: '', parallel: false, skipInCi: false, onlyInCi: false, timeout: Infinity, retry: 0, todo: false }
}) {
    let _group = new Group(desc);
    if (typeof (arguments[1]) === 'object') {
        _group.beforeEach = beforeEach;
        _group.before = before;
        _group.tests = tests;
        _group.parallelTests = [];
        _group.serialTests = [];
        _group.afterEach = afterEach;
        _group.after = after;
        _group.options = options;

        current_group = _group;
    }
    else {
        console.warn(`The 2nd argument needs to be an object!`);
    }
    groups.push(current_group);

}
/**
 * @param  {String} desc
 * @param  {Function} fn
 * @param  {(TestOptions | null)} TestOptions
 */
function test(desc, fn, { skip, reasonToSkip, parallel, skipInCi, onlyInCi, timeout, retry, todo } = {
    skip: false,
    reasonToSkip: "",
    parallel: true,
    skipInCi: false,
    onlyInCi: false,
    timeout: Infinity,
    retry: 0,
    todo: false
}) {
    let t = new Test(desc, fn);
    t.options = { skip, reasonToSkip, parallel, skipInCi, onlyInCi, timeout, retry, todo }
    report(t);
    return t;
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

// The HOOKS
/**
 * @returns {Hook}
 */
function before(desc, fn, { skip, reasonToSkip, parallel, skipInCi, onlyInCi, timeout, retry } = {
    skip: false,
    reasonToSkip: "",
    parallel: true,
    skipInCi: false,
    onlyInCi: false,
    timeout: Infinity,
    retry: 0
}) {
    let hook = new Hook(desc, fn);
    hook.type = hooks.types.BEFORE;
    hook.options = { skip, reasonToSkip, parallel, skipInCi, onlyInCi, timeout, retry }
    return hook;

}
// The HOOKS
/**
 * @returns {Hook}
 */
 function beforeEach(desc, fn, { skip, reasonToSkip, parallel, skipInCi, onlyInCi, timeout, retry } = {
    skip: false,
    reasonToSkip: "",
    parallel: true,
    skipInCi: false,
    onlyInCi: false,
    timeout: Infinity,
    retry: 0
}) {
    let hook = new Hook(desc, fn);
    hook.type = hooks.types.BEFOREEACH;
    hook.options = { skip, reasonToSkip, parallel, skipInCi, onlyInCi, timeout, retry }
    return hook;

}
// The HOOKS
/**
 * @returns {Hook}
 */
 function afterEach(desc, fn, { skip, reasonToSkip, parallel, skipInCi, onlyInCi, timeout, retry } = {
    skip: false,
    reasonToSkip: "",
    parallel: true,
    skipInCi: false,
    onlyInCi: false,
    timeout: Infinity,
    retry: 0
}) {
    let hook = new Hook(desc, fn);
    hook.type = hooks.types.AFTEREACH;
    hook.options = { skip, reasonToSkip, parallel, skipInCi, onlyInCi, timeout, retry }
    return hook;

}
// The HOOKS
/**
 * @returns {Hook}
 */
 function after(desc, fn, { skip, reasonToSkip, parallel, skipInCi, onlyInCi, timeout, retry } = {
    skip: false,
    reasonToSkip: "",
    parallel: true,
    skipInCi: false,
    onlyInCi: false,
    timeout: Infinity,
    retry: 0
}) {
    let hook = new Hook(desc, fn);
    hook.type = hooks.types.AFTER;
    hook.options = { skip, reasonToSkip, parallel, skipInCi, onlyInCi, timeout, retry }
    return hook;

}


async function runGroups() {
    for (var index = 0; index < groups.length; index++) {
        var group = groups[index];
        console.log(group.desc);
        await group.run();
    }
};

module.exports = { group, test, step, before, beforeEach, afterEach, after, runGroups };