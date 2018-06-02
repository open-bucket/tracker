/**
 *  Lib imports
 */
// eslint-disable-next-line no-unused-vars
const log = require('debug')('obn-tracker:routes:producer');

/**
 * Project imports
 */
const {createRoute} = require('../util');

function getProducer(request, response) {
    // This is a sample endpoint
    response.send('getProducer - OK');
}

function registerProducer(request, response) {
    // This is a sample endpoint
    response.send('registerProducer - OK');
}

module.exports = createRoute('/producers', (router) => {
    return router
        .post('/', registerProducer)
        .get('/me', getProducer);
});
