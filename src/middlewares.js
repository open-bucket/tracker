/**
 * Lib imports
 */
const {BAD_REQUEST} = require('http-status-codes');
const {validationResult} = require('express-validator/check');

function sequelizeErrorHandler(error, request, response, next) {
    if (error.name === 'SequelizeUniqueConstraintError') {
        const message = `${error.errors[0].path} already exists`;
        response.status(BAD_REQUEST).send({message});
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

module.exports = {
    sequelizeErrorHandler,
    validate
};
