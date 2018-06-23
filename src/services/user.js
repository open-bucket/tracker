/**
 * Project imports
 */
const {createDebugLogger} = require('../utils');
const db = require('../db');
const {createJWT} = require('./crypto');

// eslint-disable-next-line no-unused-vars
const log = createDebugLogger('services:user');

function getUserById(userId) {
    return db.User.findOne({
        attributes: {exclude: ['password']},
        where: {id: userId}
    });
}

function register({username, password}) {
    // Naively save password - TODO: hash password
    return db.User.create({username, password});
}

function login({username, password}) {
    return db.User.findOne({
        attributes: {exclude: ['password']},
        where: {username, password}
    }).then(userInfo => userInfo && {userInfo, token: createJWT({userId: userInfo.id})});
}

module.exports = {
    register,
    login,
    getUserById
};
