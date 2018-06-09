/**
 * Project imports
 */
const {createLogFn, createRoute} = require('../utils');

// eslint-disable-next-line no-unused-vars
const log = createLogFn('routes:producer');

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
