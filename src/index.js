/**
 * Lib imports
 */
const http = require('http');
const log = require('debug')('obn-tracker:index');

/**
 * Project imports
 */
const app = require('./app');
const {PORT} = require('./configs');

const server = http.createServer(app);

server.listen(PORT, () => {
    log(`OBN Tracker is listening on port ${PORT}`);
});


