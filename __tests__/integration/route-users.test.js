/**
 * Lib imports
 */
const {CREATED, BAD_REQUEST, OK, UNAUTHORIZED} = require('http-status-codes');

/**
 * Project imports
 */
const {HTTP_METHODS} = require('../../src/enums');
const db = require('../../src/db');
const {verifyJWT} = require('../../src/services/crypto');
const {testAPI, login} = require('./utils');

describe('/users integration test', () => {
    const URL = '/users';

    beforeEach(() => {
        return db.sequelize.sync({force: true, match: /-test$/});
    });

    afterAll(async () => {
        await db.sequelize.drop();
        await db.sequelize.close();
    });

    it('should return CREATED when register new user successfully', async () => {
        // WHEN
        const response = await testAPI(HTTP_METHODS.POST, URL)
            .send({username: 'validUsername', password: 'validPassword'});

        // THEN
        expect(response.statusCode).toBe(CREATED);
    });

    it('should return BAD_REQUEST when register a user with existing username', async () => {
        // GIVEN
        const EXISTING_USER = {
            username: 'helloWorld',
            password: 'helloWorld'
        };
        await db.User.create(EXISTING_USER);

        // WHEN
        const response = await testAPI(HTTP_METHODS.POST, URL)
            .send(EXISTING_USER);

        // THEN
        expect(response.statusCode).toBe(BAD_REQUEST);
        expect(response.body).toEqual({message: 'username already exists'});
    });

    it('should return BAD_REQUEST when sending missing fields', async () => {
        // GIVEN
        const missingCases = [{password: 'helloWorld'}, {username: 'helloWorld'}, {}];

        // WHEN
        const [
            resMissingUsername,
            resMissingPassword,
            resMissingAll
        ] = await Promise.all(missingCases.map(c => testAPI(HTTP_METHODS.POST, URL).send(c)));

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
        const response = await testAPI(HTTP_METHODS.POST, `${URL}/login`).send(EXISTING_USER);

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
        const response = await testAPI(HTTP_METHODS.POST, `${URL}/login`).send({username: 'oopss', password: 'oopss'});

        // THEN
        expect(response.statusCode).toBe(BAD_REQUEST);
        expect(response.body).toEqual(expectedError);
    });

    it('should return UNAUTHORIZED when get user info with incorrect token', async () => {
        // WHEN
        const response = await testAPI(HTTP_METHODS.GET, `${URL}/me`, {token: 'invalid token'}).send();

        // THEN
        expect(response.statusCode).toBe(UNAUTHORIZED);
    });

    it('should return OK and User info when get user info with correct token', async () => {
        // GIVEN
        const EXISTING_USER = {
            username: 'helloWorld',
            password: 'helloWorld'
        };
        const expectedUserInfo = {
            id: 1,
            username: 'helloWorld'
        };
        await db.User.create(EXISTING_USER);
        const token = await login(EXISTING_USER);

        // WHEN
        const response = await testAPI(HTTP_METHODS.GET, `${URL}/me`, {token}).send();

        // THEN
        expect(response.statusCode).toBe(OK);
        expect(response.body).toMatchObject(expectedUserInfo);
    });

});
