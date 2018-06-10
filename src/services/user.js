/**
 * Lib imports
 */
const jwt = require('jsonwebtoken');
const {partialRight} = require('ramda');

/**
 * Project imports
 */
const {createLogFn} = require('../utils');
const db = require('../db');
const {JWT_SECRET} = require('../configs');

// eslint-disable-next-line no-unused-vars
const log = createLogFn('services:user');

function register({username, password}) {
    // Naively save password - TODO: hash password
    return db.User.create({username, password});
}

function login({username, password}) {
    const _createAuthToken = partialRight(jwt.sign.bind(jwt), [JWT_SECRET, {expiresIn: '5h'}]);

    return db.User.findOne({where: {username, password}})
        .then(user => ({
            userInfo: user.toJSON(),
            token: _createAuthToken({userId: user.id})
        }));
}

module.exports = {
    register,
    login
};
