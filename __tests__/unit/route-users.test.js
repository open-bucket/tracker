/**
 * Lib imports
 */
const supertest = require('supertest');

/**
 * Project imports
 */
const app = require('../../src/app');

describe('Users Route Unit Test', () => {
    it('should save data to Users collection correctly when register new user', () => {
        return supertest(app)
            .post('/users')
            .send()
            .expect(200);
    });
});
