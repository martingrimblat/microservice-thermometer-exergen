const util = require('util');
const {Console} = console;

class Logger extends Console {
    constructor(stdout, stderr, ...otherArgs) {
        super(stdout, stderr, ...otherArgs);
    }

    log(...args) {
        super.log(Date.now(), '::', util.format(...args));
    }

    error(...args) {
        super.error(Date.now(), '::', util.format(...args));
    }
}

module.exports = (function () {
    return new Logger(process.stdout, process.stderr);
}());
