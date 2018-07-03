const router = require('express').Router(); 
const { CREATED, NOT_FOUND, OK } = require('http-status-codes'); 
const { check } = require('express-validator/check'); 
 
/** 
 * Project imports 
 */ 
const { createDebugLogger } = require('../utils'); 
const { validate, auth } = require('../http/middlewares'); 
const { upload, getFile } = require('../services/file'); 
 
// eslint-disable-next-line no-unused-vars 
const log = createDebugLogger('routes:consumer'); 
 
router.post('/', 
    validate([check('name').trim().not().isEmpty()]), 
    validate([check('magnetUris').trim().not().isEmpty()]), 
    validate([check('consumerId').trim().not().isEmpty()]), 
    auth(), 
    (request, response, next) => { 
        const userId = request.user.id; 
        const { name, magnetUris, consumerId } = request.body; 
        return upload({ userId, consumerId, name, magnetUris }) 
            .then(file => { 
                response.status(CREATED).send(file); 
            }) 
            .catch(next); 
    }); 
 
module.exports = { 
    path: '/files', 
    router 
};