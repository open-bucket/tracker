/**
 * Lib imports
 */
const supertest = require('supertest');

/**
 * Project imports
 */
const app = require('../../src/app');

describe('Consumers Route Unit Test', () => {
    it('should save correct data to DB when createConsumer', () => {
        return supertest(app)
            .post('/consumers')
            .send()
            .expect(200);
    });
});
