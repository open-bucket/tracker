const {DB_USERNAME, DB_PASSWORD, DB_DIALECT, DB_NAME, DB_HOST, DB_PORT, DB_LOGGING} = require('../configs');

const config = {
    database: DB_NAME,
    username: DB_USERNAME,
    password: DB_PASSWORD,
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DIALECT,
    logging: Boolean(DB_LOGGING),
    migrationStorage: 'sequelize',
    seederStorage: 'sequelize'
};

module.exports = {
    // Used by app for convenience since we don't differentiate among node envs.
    ...config,

    // Used for migration/seeding by sequelize-cli, which requires specific config
    // for each node environment.
    development: config,
    testing: config,
    production: config
};
