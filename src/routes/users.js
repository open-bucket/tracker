/**
 * Lib imports
 */
const router = require('express').Router();
const {CREATED, OK} = require('http-status-codes');
const {check} = require('express-validator/check');

/**
 * Project imports
 */
const {createLogFn} = require('../utils');
const {register, login} = require('../services/user');
const {validate} = require('../middlewares');

// eslint-disable-next-line no-unused-vars
const log = createLogFn('routes:users');

router
    .get('/me', (request, response) => {
        // This is the sample endpoint
        response.send('sampleGET - OK');
    })
    .post('/',
        validate([
            check('username').isLength({min: 5}).withMessage('username must be at least 5 chars long'),
            check('password').isLength({min: 5}).withMessage('password must be at least 5 chars long'),
        ]),
        (request, response, next) => {
            return register(request.body)
                .then(() => response.status(CREATED).send('OK'))
                .catch(next);
        })
    .post('/login',
        validate([
            check('username').isLength({min: 5}).withMessage('username must be at least 5 chars long'),
            check('password').isLength({min: 5}).withMessage('password must be at least 5 chars long'),
        ]),
        (request, response, next) => {
            return login(request.body)
                .then((data) => response.status(OK).send(data))
                .catch(next);
        });

module.exports = {
    path: '/users',
    router
};
