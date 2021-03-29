const { Group, Test } = require("./test");


/**
 * @var {Group} current_group
 */
let current_group;
let groups = [];

/**
* @typedef {{desc: (String|null),
*            fn: Function,
*            options: BaseOptions}} Before
*/

/**
* @typedef {{skip: boolean,
*            reasonToSkip: string,
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
* @typedef {{callBack: Function,
*            parallel: boolean,
*            before: ({}|[Function],
*            beforeEach: [Function],
*            tests: [Function],
*            afterEach: [Function],
*            after: [Function],
*            options: TestOptions,
*            }} detailedObject
*/

/**
 * @param  {String} desc
 * @param  {detailedObject} 
 */
function group(desc, {
    before,
    beforeEach,
    tests,
    afterEach,
    after,
    options = {}
}) {
    if (typeof (arguments[1]) === 'object') {
        let _group = new Group(desc);
        _group.beforeEach = beforeEach;
        _group.before = before;
        _group.parallelTests = tests.filter(t => t.parallel === true);
        _group.serialTests = tests.filter(t => t.parallel === false);
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
 * @param  {TestOptions}
 */
function test(desc, fn, {
    skip = false,
    reasonToSkip = "",
    parallel = true,
    skipInCi = false,
    onlyInCi = false,
    timeout = Infinity,
    retry = 0,
    todo = false
} = {}) {
    let t = new Test(desc, fn);
    if (arguments[2] !== undefined) {
        t.skip = skip;
        t.reasonToSkip = reasonToSkip;
        t.parallel = parallel;
        t.skipInCi = skipInCi;
        t.onlyInCi = onlyInCi;
        t.timeout = timeout;
        t.retry = retry;
        t.todo = todo;
    }
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

async function runGroups() {
    for (var index = 0; index < groups.length; index++) {
        var group = groups[index];
        console.log(group.desc);
        await group.run();
    }
};

module.exports = { group, test, step, runGroups };