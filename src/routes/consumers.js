/**
 * Lib imports
 */
const router = require('express').Router();
const {CREATED, NOT_FOUND} = require('http-status-codes');
const {check} = require('express-validator/check');

/**
 * Project imports
 */
const {createLogFn} = require('../utils');
const {validate, auth} = require('../middlewares');
const {create, getConsumerByIdAndUserId} = require('../services/consumer');

// eslint-disable-next-line no-unused-vars
const log = createLogFn('routes:consumer');

router
    .get('/:id', auth(), (request, response, next) => {
        const {id} = request.params;
        const userId = request.user.id;
        return getConsumerByIdAndUserId({id, userId})
            .then(consumer => consumer
                ? response.send(consumer)
                : response.status(NOT_FOUND).send(`Can't find your consumer with id: ${request.params.id}`))
            .catch(next);
    })
    .post('/',
        validate([check('address').trim().not().isEmpty()]),
        auth(),
        (request, response, next) => {
            const {address} = request.body;
            const userId = request.user.id;
            return create({address, userId})
                .then((data) => {
                    log('inside post consumers:', data);
                    return response.status(CREATED).send(data);
                })
                .catch(next);
        });

module.exports = {
    path: '/consumers',
    router
};
