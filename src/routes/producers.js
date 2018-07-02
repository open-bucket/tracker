/**
 * Lib imports
 */
const router = require('express').Router();
const {CREATED} = require('http-status-codes');

/**
 * Project imports
 */
const {createDebugLogger} = require('../utils');
const {auth} = require('../middlewares');
const {create, getProducersByUserId} = require('../services/producer');

// eslint-disable-next-line no-unused-vars
const log = createDebugLogger('routes:producer');

router.post('/', auth(),
    (request, response, next) => {
        const {name} = request.body;
        const userId = request.user.id;
        return create({name, userId})
            .then((data) => response.status(CREATED).send(data))
            .catch(next);
    });

router.get('/', auth(),
    (request, response, next) => getProducersByUserId(request.user.id)
        .then(ps => response.send(ps))
        .catch(next));

module.exports = {
    path: '/producers',
    router
};
