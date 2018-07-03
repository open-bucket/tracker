/**
 * Lib imports
 */
const {BAD_REQUEST, UNAUTHORIZED, INTERNAL_SERVER_ERROR, NOT_FOUND} = require('http-status-codes');
const {validationResult} = require('express-validator/check');

/**
 * Project imports
 */
const {getUserById} = require('../services/user');
const {verifyJWTP} = require('../services/crypto');
const {createDebugLogger} = require('../utils');

// eslint-disable-next-line no-unused-vars
const log = createDebugLogger('middlewares');

function sequelizeErrorHandler(error, request, response, next) {
    if (error.name === 'SequelizeUniqueConstraintError') {
        const message = `${error.errors[0].path} already exists`;
        response.status(BAD_REQUEST).send(message);
    } else if (error.name === 'SequelizeDatabaseError') {
        log('DB Error: ', error);
        response.status(INTERNAL_SERVER_ERROR).send(error.message);
    } else {
        next(error);
    }
}

function validate(validateMiddlewares) {
    function handleValidationErrorMiddleware(request, response, next) {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({errors: errors.mapped()});
        }
        next();
    }

    return [...validateMiddlewares, handleValidationErrorMiddleware];
}

function auth() {
    return function (request, response, next) {
        function _verifyToken(token) {
            return verifyJWTP(token).then(({userId}) => userId);
        }

        const auth = request.headers.authorization;

        return auth
            ? _verifyToken(auth.substring('Bearer '.length))
                .then(userId => getUserById(userId))
                .then(user => {
                    if (user) {
                        request.user = user;
                        next();
                    } else {
                        response.status(NOT_FOUND).send('User is not found');
                    }
                })
                .catch((error) => response.status(UNAUTHORIZED).send(error))
            : response.status(UNAUTHORIZED).send('Auth token is invalid');
    };
}


module.exports = {
    sequelizeErrorHandler,
    validate,
    auth
};
