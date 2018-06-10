module.exports = {
    PORT: Number(process.env.TRACKER_PORT) || 3000,
    DB_USERNAME: process.env.DB_USERNAME || 'hungnvu',
    DB_PASSWORD: process.env.DB_PASSWORD || null,
    DB_DIALECT: 'postgres',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: Number(process.env.DB_PORT) || 5432,
    DB_NAME: process.env.DB_NAME || 'obn',
    DB_LOGGING: process.env.DB_LOGGING == true,
    JWT_SECRET: process.env.JWT_SECRET || 'shhhh'
};
