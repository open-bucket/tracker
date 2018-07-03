/**
 * Lib imports
 */
const router = require('express').Router();
const {CREATED, NOT_FOUND} = require('http-status-codes');
const {check} = require('express-validator/check');

/**
 * Project imports
 */
const {validate, auth} = require('../http/middlewares');
const {create, getConsumerByIdAndUserId, getConsumerByUserId} = require('../services/consumer');

router.get('/:id', auth(),
    validate([check('id').not().isEmpty().isNumeric()]),
    (request, response, next) => {
        const {id} = request.params;
        const userId = request.user.id;
        return getConsumerByIdAndUserId({id, userId})
            .then(consumer => consumer
                ? response.send(consumer)
                : response.status(NOT_FOUND).send(`Can't find your consumer with id: ${request.params.id}`))
            .catch(next);
    });

router.get('/', auth(),
    (request, response, next) => getConsumerByUserId(request.user.id)
        .then(cs => response.send(cs))
        .catch(next));

router.post('/', auth(),
    validate([check('name').trim().not().isEmpty()]),
    (request, response, next) => {
        const {name, tier} = request.body;
        const userId = request.user.id;
        return create({tier, name, userId})
            .then((data) => response.status(CREATED).send(data))
            .catch(next);
    });

module.exports = {
    path: '/consumers',
    router
};
