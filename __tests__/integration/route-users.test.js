/**
 * Lib imports
 */
const supertest = require('supertest');
const {CREATED, BAD_REQUEST} = require('http-status-codes');

/**
 * Project imports
 */
const app = require('../../src/app');
const db = require('../../src/db');

describe('Users Route Unit Test', () => {
    const URL = '/users';

    beforeEach(() => {
        return db.sequelize.sync({force: true, match: /-test$/});
    });

    afterAll(() => {
        return db.sequelize.close();
    });

    it('should return 201 when register new user successfully', async () => {
        // WHEN
        const response = await supertest(app)
            .post(URL)
            .send({username: 'validUsername', password: 'validPassword'});

        // THEN
        expect(response.statusCode).toBe(CREATED);
    });

    it('should return 400 when register a user with existing username', async () => {
        // GIVEN
        const EXISTING_USER = {
            username: 'oops',
            password: 'oops'
        };
        await db.User.create(EXISTING_USER);

        // WHEN
        const response = await supertest(app)
            .post(URL)
            .send(EXISTING_USER);

        // THEN
        expect(response.statusCode).toBe(BAD_REQUEST);
        expect(response.body).toEqual({message: 'username already exists'});
    });

});
