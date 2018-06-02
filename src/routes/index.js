/**
 *  Lib imports
 */
// eslint-disable-next-line no-unused-vars
const log = require('debug')('obn-tracker:ctl:index');
const {values} = require('ramda');
const router = require('express').Router();
const path = require('path');


/**
 * Project imports
 */
// Includes all files in current dir except the current file
const routeCtors = require('require-all')({
    dirname: __dirname,
    filter: (fileName) => fileName !== path.basename(__filename) && fileName
});

function createRouter(router) {
    return values(routeCtors)
        .reduce((router, currentRouteCtor) => {
            const currentRoute = currentRouteCtor(router);
            return router.use(currentRoute.path, currentRoute);
        }, router);
}

module.exports = createRouter(router);
