/**
 *  Lib imports
 */
// eslint-disable-next-line no-unused-vars
const log = require('debug')('obn-tracker:ctl:index');
const {values} = require('ramda');
const express = require('express');
const path = require('path');


/**
 * Project imports
 */
// Includes all files in current dir except the current file
const routes = require('require-all')({
    dirname: __dirname,
    filter: (fileName) => fileName !== path.basename(__filename) && fileName
});

function createRouter() {
    let router = express.Router();
    // Register routes
    router = values(routes)
        .reduce((router, currentRoute) =>
            router.use(currentRoute.path, currentRoute), router);
    return router;
}

module.exports = createRouter();
