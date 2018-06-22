/**
 * Project imports
 */
const db = require('../db');
const {createLogFn} = require('../utils');

// eslint-disable-next-line no-unused-vars
const log = createLogFn('services:consumer');

function create({address, userId}) {
    return db.Consumer.create({address, userId});
}

function getConsumerByIdAndUserId({id, userId}) {
    return db.Consumer.findOne({where: {id, userId}});
}

function getConsumerByUserId(userId) {
    return db.Consumer.findAll({where: {userId}});
}

module.exports = {
    create,
    getConsumerByIdAndUserId,
    getConsumerByUserId
};