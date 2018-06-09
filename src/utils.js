/**
 * Lib imports
 */
const {curry} = require('ramda');
const Task = require('folktale/concurrency/task');
const debug = require('debug');

function createRoute(path, createChildRouterFn) {
    return function (router) {
        router.path = path;
        router = createChildRouterFn(router);
        return router;
    };
}

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

function _createLogFn(namespace, msg, value) {
    return _trace(debug(`obn-tracker:${namespace}`), msg, value);
}

function _createLogFnT(namespace, msg, value) {
    return Task.of(_createLogFn(namespace, msg, value));
}

const createLogFn = curry(_createLogFn);
const createLogFnT = curry(_createLogFnT);

module.exports = {
    createRoute,
    constant,
    createLogFn,
    createLogFnT
};
