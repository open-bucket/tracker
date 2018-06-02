const router = require('express').Router();
// eslint-disable-next-line no-unused-vars
const log = require('debug')('obn-tracker:ctl:consumer');

// Register route's path
router.path = '/consumers';

function registerConsumer(request, response) {
    response.send('OK la!!');
}

// Register child routes
router.post('/', registerConsumer);

module.exports = router;
