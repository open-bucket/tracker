/**
 * Lib imports
 */
const uuid = require('uuid/v4');

/**
 * Project imports
 */
const db = require('../db');
const {createLogFn} = require('../utils');

// eslint-disable-next-line no-unused-vars
const log = createLogFn('services:consumer');

function create({address, userId}) {
    return db.Consumer.create({address, userId, key: uuid()});
}

function getConsumerByIdAndUserId({id, userId}) {
    return db.Consumer.findOne({
        attributes: {exclude: ['key']},
        where: {id, userId}
    });
}

function getConsumerByUserId(userId) {
    return db.Consumer.findAll({
        attributes: {exclude: ['key']},
        where: {userId}
    });
}

module.exports = {
    create,
    getConsumerByIdAndUserId,
    getConsumerByUserId
};
