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
const {create, getProducersByUserId, getProducerByIdAndUserId, updateProducerByIdAndUserId} = require('../services/producer');
const PM = require('../ws/producer-manager');

// NOTICE: only use for /:id/* endpoints & MUST be added before auth() middleware
function authProducer() {
    return (request, response, next) => {
        const {id} = request.params;
        const userId = request.user.id;
        getProducerByIdAndUserId({id, userId})
            .then((producer) => {
                if (producer) {
                    request.producer = producer;
                    return next();
                }
                return response.status(NOT_FOUND).send(`User ${userId} doesn't have producer ${id}`);
            });
    };
}

router.post('/', auth(),
    (request, response, next) => {
        const {name} = request.body;
        const userId = request.user.id;
        return create({name, userId})
            .then((data) => response.status(CREATED).send(data))
            .catch(next);
    });

router.get('/connected', auth(),
    (request, response, next) => {
        return getProducersByUserId(request.user.id)
            .then(ps => ps.filter(p => !!PM.connectedProducers[p.id]))
            .then(result => response.send(result))
            .catch(next);
    });

router.get('/:id', auth(), authProducer(),
    validate([check('id').isNumeric()]),
    (request, response) => {
        response.send(request.producer);
    });

router.put('/:id', auth(), authProducer(),
    validate([check('id').isNumeric()]),
    (request, response, next) => {
        const {id} = request.params;
        const userId = request.user.id;
        return updateProducerByIdAndUserId({id, userId, newValue: request.body})
            .then((updatedConsumer) => response.send(updatedConsumer))
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
