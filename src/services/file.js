/**
 * Lib imports
 */
const {assoc} = require('ramda');

/**
 * Project imports
 */
const db = require('../db');

function getFilesByConsumerId(consumerId) {
    return db.File.findAll({where: {consumerId}, order: [['id', 'ASC']]});
}

function findFileById(id) {
    return db.File.findById(id);
}

async function createFileAndShardP(data) {
    const {tier} = await db.Consumer.findOne({
        attributes: ['tier'],
        where: {id: data.consumerId}
    });
    return db.File.create(assoc('tier', tier, data), {
        include: [{
            model: db.Shard,
            as: 'shards'
        }]
    });
}

module.exports = {
    getFilesByConsumerId,
    createFileAndShardP,
    findFileById
};
