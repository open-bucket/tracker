/**
 * Project imports
 */
const {createLogFn} = require('../utils');
const db = require('../db');

// eslint-disable-next-line no-unused-vars
const log = createLogFn('services:user');

function register({username, password}) {
    // Naively save password - TODO: hash password
    return db.User.create({username, password});
}

module.exports = {
    register
};
