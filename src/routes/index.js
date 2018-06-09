/**
 *  Lib imports
 */
// eslint-disable-next-line no-unused-vars
const {values} = require('ramda');
const router = require('express').Router();
const path = require('path');


/**
 * Project imports
 */
// Includes all files in current dir except the current file
const routes = require('require-all')({
    dirname: __dirname,
    filter: (fileName) => fileName !== path.basename(__filename) && fileName
});
const {createLogFn} = require('../utils');

// eslint-disable-next-line no-unused-vars
const log = createLogFn('routes:index');

function createRouter(router) {
    return values(routes)
        .map(({path, router: childRouter}) => router.use(path, childRouter));
}

module.exports = createRouter(router);
