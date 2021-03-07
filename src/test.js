class Group {
    constructor(desc) {
        this.desc = desc;
    }
}
class Test {
    constructor(desc, fn) {
        this.desc = desc;
        this.fn = fn;
        this.subtests = [];
    }
}

module.exports = {Test};