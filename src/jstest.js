//@ts-check

const report = require("./report");
const { Group, Test } = require("./test");


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
* @typedef {{desc: (String|null),
*            fn: Function,
*            options: BaseOptions}} Hook
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
    if (arguments[2] !== undefined) {
        t.options.skip = skip;
        t.options.reasonToSkip = reasonToSkip;
        t.options.parallel = parallel;
        t.options.skipInCi = skipInCi;
        t.options.onlyInCi = onlyInCi;
        t.options.timeout = timeout;
        t.options.retry = retry;
        t.options.todo = todo;
    }
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
function before(desc, fn, { reasonToSkip, parallel, skipInCi, onlyInCi, timeout, retry } = {
    reasonToSkip: "",
    parallel: true,
    skipInCi: false,
    onlyInCi: false,
    timeout: Infinity,
    retry: 0
}) {
    return {
        desc: desc,
        fn: fn,
        options: {
            reasonToSkip,
            parallel,
            skipInCi,
            onlyInCi,
            timeout,
            retry
        }
    }

}

const beforeEach = before;
const afterEach = before;
const after = before;

async function runGroups() {
    for (var index = 0; index < groups.length; index++) {
        var group = groups[index];
        console.log(group.desc);
        await group.run();
    }
};

module.exports = { group, test, step, before, beforeEach, afterEach, after, runGroups };