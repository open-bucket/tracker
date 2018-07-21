/**
 * Lib imports
 */
const {assoc, map, prop} = require('ramda');
const BPromise = require('bluebird');

/**
 * Project imports
 */
const db = require('../db');
const {tierToDesiredAv} = require('../utils');

function getAllFilesByConsumerId(consumerId) {
    return db.File.findAll({where: {consumerId}, order: [['id', 'ASC']]});
}

function getAllFilesP() {
    return db.File.findAll();
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
        return {id, address, servingBytes, shards};
    });
}

async function getUnmatchedAvShardsP(fileId) {
    const file = await db.File.findById(fileId);
    const desiredAv = tierToDesiredAv(file.tier);

    const shards = await db.Shard.findAll({where: {fileId}});

    return BPromise.filter(shards, async s => {
        const producers = await s.getProducers();
        return producers.length < desiredAv;
    });
}

function getShards(fileId) {
    return db.Shard.findAll({where: {fileId}});
}

function deleteFile(fileId) {
    return db.File.destroy({where: {id: fileId}});
}

module.exports = {
    getAllFilesP,
    getAllFilesByConsumerId,
    createFileAndShardP,
    getFileById,
    getServingProducersP,
    getShards,
    getUnmatchedAvShardsP,
    deleteFile
};
