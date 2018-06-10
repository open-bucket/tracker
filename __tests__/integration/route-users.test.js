/**
 * Lib imports
 */
const supertest = require('supertest');
const {CREATED, BAD_REQUEST, OK} = require('http-status-codes');

/**
 * Project imports
 */
const app = require('../../src/app');
const db = require('../../src/db');
const {verifyJWT} = require('../../src/services/crypto');

describe('Users Route Unit Test', () => {
    const URL = '/users';

    beforeEach(() => {
        return db.sequelize.sync({force: true, match: /-test$/});
    });

    afterAll(async () => {
        await db.sequelize.drop();
        await db.sequelize.close();
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
            username: 'helloWorld',
            password: 'helloWorld'
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

    it('should return 400 when sending missing fields', async () => {
        // GIVEN
        const missingCases = [{password: 'helloWorld'}, {username: 'helloWorld'}, {}];

        // WHEN
        const [
            resMissingUsername,
            resMissingPassword,
            resMissingAll
        ] = await Promise.all(missingCases.map(c => supertest(app).post(URL).send(c)));

        // THEN
        expect(resMissingUsername.statusCode).toBe(BAD_REQUEST);
        expect(resMissingUsername.body.errors.username.msg).toEqual('username must be at least 5 chars long');

        expect(resMissingPassword.statusCode).toBe(BAD_REQUEST);
        expect(resMissingPassword.body.errors.password.msg).toEqual('password must be at least 5 chars long');

        expect(resMissingAll.statusCode).toBe(BAD_REQUEST);
    });

    it('should return OK and JWT Token when Login with correct username & password', async () => {
        // GIVEN
        const EXISTING_USER = {
            username: 'helloWorld',
            password: 'helloWorld'
        };
        await db.User.create(EXISTING_USER);
        const expectedDecodedTokenInfo = {userId: 1};

        // WHEN
        const response = await supertest(app)
            .post(`${URL}/login`)
            .send(EXISTING_USER);

        // THEN
        expect(response.statusCode).toBe(OK);
        await expect(verifyJWT(response.body.token)).resolves.toMatchObject(expectedDecodedTokenInfo);
    });

    it('should return BAD_REQUEST when Login with incorrect username or password', async () => {
        // GIVEN
        const EXISTING_USER = {
            username: 'helloWorld',
            password: 'helloWorld'
        };
        await db.User.create(EXISTING_USER);
        const expectedError = {
            msg: 'username or password is incorrect'
        };

        // WHEN
        const response = await supertest(app)
            .post(`${URL}/login`)
            .send({username: 'oopss', password: 'oopss'});

        // THEN
        expect(response.statusCode).toBe(BAD_REQUEST);
        expect(response.body).toEqual(expectedError);
    });

});
