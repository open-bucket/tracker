/**
 * Lib imports
 */
const {prop} = require('ramda');

/**
 * Project imports
 */
const db = require('../db');

function verifyShardP({id, name, hash, size}) {
    return db.Shard.findOne({
        where: {id, name, hash, size}
    });
}

function getShardAvP(shard) {
    return shard.getProducers().then(prop('length'));
}

module.exports = {
    verifyShardP,
    getShardAvP
};
