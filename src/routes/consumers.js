/**
 * Lib imports
 */
const router = require('express').Router();
const {CREATED, NOT_FOUND} = require('http-status-codes');
const {check} = require('express-validator/check');

/**
 * Project imports
 */
const {createDebugLogger} = require('../utils');
const {validate, auth} = require('../middlewares');
const {create, getConsumerByIdAndUserId, getConsumerByUserId} = require('../services/consumer');

// eslint-disable-next-line no-unused-vars
const log = createDebugLogger('routes:consumer');

router
    .get('/:id',
        validate([
            check('id').not().isEmpty()
                .isNumeric()]),
        auth(), (request, response, next) => {
            const {id} = request.params;
            const userId = request.user.id;
            return getConsumerByIdAndUserId({id, userId})
                .then(consumer => consumer
                    ? response.send(consumer)
                    : response.status(NOT_FOUND).send(`Can't find your consumer with id: ${request.params.id}`))
                .catch(next);
        })
    .get('/', auth(), (request, response, next) =>
        getConsumerByUserId(request.user.id)
            .then(consumers => response.send(consumers))
            .catch(next))
    .post('/',
        validate([check('address').trim().not().isEmpty()]),
        auth(),
        (request, response, next) => {
            const {address} = request.body;
            const userId = request.user.id;
            return create({address, userId})
                .then((data) => response.status(CREATED).send(data))
                .catch(next);
        });
// TODO: make PUT endpoint, user can edit address only when consumer state is INACTIVE
// User can upgrade consumer Tier

// TODO: make DELETE endpoint, if user delete active consumer, user can withdraw their Ether from the contract of that consumer

module.exports = {
    path: '/consumers',
    router
};
