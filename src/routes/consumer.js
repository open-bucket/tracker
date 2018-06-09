/**
 * Project imports
 */
const {createLogFn, createRoute} = require('../utils');

// eslint-disable-next-line no-unused-vars
const log = createLogFn('routes:consumer');

function registerConsumer(request, response) {
    // This is a sample endpoint
    response.send('registerConsumer - OK');
}

module.exports = createRoute('/consumers', (router) => {
    return router.post('/', registerConsumer);
});
