/**
 * Lib imports
 */
const {BAD_REQUEST} = require('http-status-codes');

function sequelizeErrorHandler(error, request, response, next) {
    if (error.name === 'SequelizeUniqueConstraintError') {
        const message = `${error.errors[0].path} already exists`;
        response.status(BAD_REQUEST).send({message});
    } else {
        next(error);
    }
}

module.exports = {
    sequelizeErrorHandler
};
