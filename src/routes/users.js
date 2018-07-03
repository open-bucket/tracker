/**
 * Lib imports
 */
const router = require('express').Router();
const {CREATED, OK, BAD_REQUEST} = require('http-status-codes');
const {check} = require('express-validator/check');

/**
 * Project imports
 */
const {createDebugLogger} = require('../utils');
const {register, login} = require('../services/user');
const {validate, auth} = require('../http/middlewares');

// eslint-disable-next-line no-unused-vars
const log = createDebugLogger('routes:users');

router
    .get('/me', auth(), (request, response) => {
        response.send(request.user);
    })
    .post('/',
        validate([
            check('username')
                .trim()
                .isLength({min: 5}).withMessage('username must be at least 5 chars long'),
            check('password')
                .trim()
                .isLength({min: 5}).withMessage('password must be at least 5 chars long'),
        ]),
        (request, response, next) =>
            register(request.body)
                .then(() => response.status(CREATED).send('OK'))
                .catch(next))
    .post('/login',
        validate([
            check('username')
                .trim()
                .isLength({min: 5}).withMessage('username must be at least 5 chars long'),
            check('password')
                .trim()
                .isLength({min: 5}).withMessage('password must be at least 5 chars long'),
        ]),
        (request, response, next) =>
            login(request.body)
                .then((data) => data
                    ? response.status(OK).send(data)
                    : response.status(BAD_REQUEST).send('username or password is incorrect'))
                .catch(next));

module.exports = {
    path: '/users',
    router
};
