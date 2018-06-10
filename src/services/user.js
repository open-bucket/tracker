/**
 * Project imports
 */
const {createLogFn} = require('../utils');
const db = require('../db');
const {createJWT} = require('./crypto');

// eslint-disable-next-line no-unused-vars
const log = createLogFn('services:user');

function register({username, password}) {
    // Naively save password - TODO: hash password
    return db.User.create({username, password});
}

function login({username, password}) {
    return db.User.findOne({where: {username, password}})
        .then(user => user
            ? {userInfo: user.toJSON(), token: createJWT({userId: user.id})}
            : null);
}

module.exports = {
    register,
    login
};
