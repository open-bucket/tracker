/**
 * Lib imports
 */
const {BAD_REQUEST, UNAUTHORIZED, INTERNAL_SERVER_ERROR} = require('http-status-codes');
const {validationResult} = require('express-validator/check');

/**
 * Project imports
 */
const {getUserById} = require('./services/user');
const {verifyJWT} = require('./services/crypto');
const {createLogFn} = require('./utils');

// eslint-disable-next-line no-unused-vars
const log = createLogFn('middlewares');

function sequelizeErrorHandler(error, request, response, next) {
    if (error.name === 'SequelizeUniqueConstraintError') {
        const message = `${error.errors[0].path} already exists`;
        response.status(BAD_REQUEST).send({message});
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
            return verifyJWT(token).then(({userId}) => userId);
        }

        const auth = request.headers.authorization;

        log('auth: ', auth);
        return auth
            ? _verifyToken(auth.substring('Bearer '.length))
                .then(userId => getUserById(userId))
                .then(user => {
                    request.user = user;
                    next();
                })
                .catch((error) => response.status(UNAUTHORIZED).send(error))
            : response.status(UNAUTHORIZED).send('Token is invalid');
    };
}


module.exports = {
    sequelizeErrorHandler,
    validate,
    auth
};
