/**
 * Lib imports
 */
const User = require('../db/user');
const Task = require('folktale/concurrency/task');

function _createUserT({username, password}) {
    return Task.fromNodeback(User.create.bind(User))({username, password});
}

function registerT(data) {
    // Naive save to save time - TODO: hash password
    return _createUserT(data);
}

module.exports = {
    registerT
};
