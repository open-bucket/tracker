module.exports = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    HTTP_PORT: Number(process.env.OBN_TRACKER_HTTP_PORT) || 3000,
    BITTORRENT_TRACKER_PORT: Number(process.env.OBN_BITTORRENT_TRACKER_PORT) || 3001,
    WS_PORT: Number(process.env.OBN_TRACKER_WS_PORT) || 4000,
    DB_USERNAME: process.env.OBN_DB_USERNAME || 'hungnvu',
    DB_PASSWORD: process.env.OBN_DB_PASSWORD || null,
    DB_DIALECT: 'postgres',
    DB_HOST: process.env.OBN_DB_HOST || 'localhost',
    DB_PORT: Number(process.env.OBN_DB_PORT) || 5432,
    DB_NAME: process.env.OBN_DB_NAME || 'obn',
    DB_LOGGING: process.env.OBN_DB_LOGGING == true,
    JWT_SECRET: process.env.OBN_JWT_SECRET || 'shhhh'
};
