/**
 * Lib imports
 */
const router = require('express').Router();
const {CREATED} = require('http-status-codes');

/**
 * Project imports
 */
const {auth} = require('../http/middlewares');
const {create, getProducersByUserId} = require('../services/producer');

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
