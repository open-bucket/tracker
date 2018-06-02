/**
 *  Lib imports
 */
// eslint-disable-next-line no-unused-vars
const log = require('debug')('obn-tracker:routes:producer');

/**
 * Project imports
 */
const {createRoute} = require('../util');

function registerConsumer(request, response) {
    // This is a sample endpoint
    response.send('registerConsumer - OK');
}

module.exports = createRoute('/consumers', (router) => {
    return router.post('/', registerConsumer);
});
