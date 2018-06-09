module.exports = {
    PORT: Number(process.env.TRACKER_PORT) || 3000,
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: Number(process.env.DB_PORT) || 27017,
    DB_NAME: process.env.DB_PORT || 'obn'
};
