/**
 * Lib imports
 */
const {curry} = require('ramda');
const BPromise = require('bluebird');
const debug = require('debug');

function constant(v) {
    return function value() {
        return v;
    };
}

function _trace(logFunc, msg, value) {
    if (value) {
        logFunc(msg, value);
    } else {
        logFunc(msg);
    }
    return value;
}

function createDebugFn(namespace) {
    return debug(`obn-tracker:${namespace}`);
}

function createDebugLogger(namespace) {
    return (msg, value) => _trace(createDebugFn(namespace), msg, value);
}

function createDebugLoggerC(namespace) {
    return curry((msg, value) => _trace(createDebugFn(namespace), msg, value));
}

function createDebugLoggerP(namespace) {
    return (msg, value) => BPromise.resolve(_trace(createDebugFn(namespace), msg, value));
}

function createDebugLoggerCP(namespace) {
    return curry((msg, value) => BPromise.resolve(_trace(createDebugFn(namespace), msg, value)));
}

module.exports = {
    constant,
    createDebugLogger,
    createDebugLoggerC,
    createDebugLoggerP,
    createDebugLoggerCP
};
