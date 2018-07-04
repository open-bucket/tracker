const db = require('../db');

function getFilesByConsumerId(consumerId) {
    return db.File.findAll({where: {consumerId}, order: [['id', 'ASC']]});
}

function createFileAndShardP(data) {
    return db.File.create(data, {
        include: [{
            model: db.Shard,
            as: 'shards'
        }]
    });
}

module.exports = {
    getFilesByConsumerId,
    createFileAndShardP
};
