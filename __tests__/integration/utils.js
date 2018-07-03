/**
 * Lib imports
 */
const supertest = require('supertest');

/**
 * Project imports
 */
const {HTTP_METHODS} = require('../../src/enums');
const {app} = require('../../src/http');

function testAPI(method = HTTP_METHODS.GET, route, options = {}) {
    const {token} = options;
    let request = supertest(app);
    switch (method) {
        case HTTP_METHODS.GET:
            request = request.get(route);
            break;
        case HTTP_METHODS.POST:
            request = request.post(route);
            break;
        default:
            request = request.get(route);
            break;
    }
    return token ? request.set('Authorization', `Bearer ${token}`) : request;
}

function login({username, password}) {
    return testAPI(HTTP_METHODS.POST, '/users/login')
        .send({username, password})
        .then(response => response.body.token);
}

describe('Util test', () => {
    it('Always pass', () => {
    });
});

module.exports = {
    testAPI,
    login
};
