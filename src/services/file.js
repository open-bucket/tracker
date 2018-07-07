/**
 * Lib imports
 */
const {assoc, map, prop} = require('ramda');

/**
 * Project imports
 */
const db = require('../db');

function getAllFilesByConsumerId(consumerId) {
    return db.File.findAll({where: {consumerId}, order: [['id', 'ASC']]});
}

function getFileById(id) {
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

async function getServingProducersP(fileId) {
    const shardIds = await db.Shard.findAll({where: {fileId}, attributes: ['id']}).then(map(prop('id')));
    const producers = await db.Producer.findAll({
        include: [{
            model: db.Shard,
            as: 'shards',
            where: {id: {$in: shardIds}}
        }]
    });
    return producers.map(({address, shards, id}) => {
        const servingBytes = shards.reduce((acc, curr) => acc + curr.size, 0);
        return {id, address, servingBytes};
    });
}

function getAllShards(fileId) {
    return db.Shard.findAll({where: {fileId}});
}

module.exports = {
    getAllFilesByConsumerId,
    createFileAndShardP,
    getFileById,
    getServingProducersP,
    getAllShards
};
