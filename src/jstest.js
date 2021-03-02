/**
 * @param  {String} desc
 * @param  {CallableFunction} fn
 */
function test(desc, fn) {
    console.log(desc);
    if (fn.constructor.name == 'AsyncFunction') {
        (async () => {
            await fn();
            console.log('async');
        })();
    } else {
        fn();
        console.log('sync');
    }
}

module.exports = { test };