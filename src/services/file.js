const db = require('../db'); 
 
function upload({ userId, consumerId, name, magnetUris }) { 
    return db.Consumer 
        .findOne({ where: { id: consumerId, userId } }) 
        .then(() => db.File.create({ 
            consumerId, 
            name, 
            magnetUris 
        })); 
} 
 
function getFileByUserIdAndConsumerId({ consumerId, userId }) { 
    return db.Consumer 
        .findOne({ where: { userId, consumerId }, order: [['id', 'ASC']] }) 
        .then(consumer => db.File.findAll({ where: { consumerId: consumer.id }, order: [['id', 'ASC']] })); 
} 
 
module.exports = { 
    upload, 
    getFileByUserIdAndConsumerId 
};