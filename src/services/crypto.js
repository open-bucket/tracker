/**
 * Lib imports
 */
const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const {partialRight} = require('ramda');


/**
 * Project imports
 */
const {JWT_SECRET} = require('../configs');

const verifyJWTP = partialRight(promisify(jwt.verify), [JWT_SECRET]);

const createJWT = partialRight(jwt.sign, [JWT_SECRET, {expiresIn: '5h'}]);

module.exports = {
    verifyJWTP,
    createJWT
};

