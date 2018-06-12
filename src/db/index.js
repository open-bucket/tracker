/**
 * Lib imports
 */
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

/**
 * Project imports
 */
const {username, password, database, host, port, dialect, logging} = require('./config');

const sequelize = new Sequelize(database, username, password, {
    host, port, dialect, logging
});

const MODELS_DIR = `${__dirname}/models`;
let db = {};
fs.readdirSync(MODELS_DIR)
    .forEach(file => {
        const model = sequelize['import'](path.join(MODELS_DIR, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
