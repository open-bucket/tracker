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
const {
    create,
    getConsumerByIdAndUserId,
    getAllConsumersByUserId,
    updateConsumerByIdAndUserId
} = require('../services/consumer');
const {getAllFilesByConsumerId} = require('../services/file');

// NOTICE: only use for /:id/* endpoints & MUST be added before auth() middleware
function authConsumer() {
    return (request, response, next) => {
        const {id} = request.params;
        const userId = request.user.id;
        getConsumerByIdAndUserId({id, userId})
            .then((consumer) => {
                if (consumer) {
                    request.consumer = consumer;
                    return next();
                }
                return response.status(NOT_FOUND).send(`User ${userId} doesn't have consumer ${id}`);
            });
    };
}

router.get('/:id/files', auth(), authConsumer(),
    validate([check('id').isNumeric()]),
    (request, response, next) => {
        const {id} = request.params;
        return getAllFilesByConsumerId(id)
            .then(files => response.send(files))
            .catch(next);
    });

router.get('/:id', auth(), authConsumer(),
    validate([check('id').isNumeric()]),
    (request, response) => {
        response.send(request.consumer);
    });

router.put('/:id', auth(), authConsumer(),
    validate([check('id').isNumeric()]),
    (request, response, next) => {
        const {id} = request.params;
        const userId = request.user.id;
        return updateConsumerByIdAndUserId({id, userId, newValue: request.body})
            .then((updatedConsumer) => response.send(updatedConsumer))
            .catch(next);
    });

router.get('/', auth(),
    (request, response, next) =>
        getAllConsumersByUserId(request.user.id)
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
