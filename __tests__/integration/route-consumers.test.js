/**
 * Lib imports
 */
const {CREATED, OK} = require('http-status-codes');

/**
 * Project imports
 */
const db = require('../../src/db');
const {HTTP_METHODS} = require('../../src/enums');
const {testAPI, login} = require('./utils');

describe('/consumers integration test', () => {

    const URL = '/consumers';

    const EXISTING_USERS = [{
        username: 'helloWorld',
        password: 'helloWorld'
    }, {
        username: 'helloWorld1',
        password: 'helloWorld1'
    }];

    beforeEach(async () => {
        await db.sequelize.sync({force: true, match: /-test$/});
        await db.User.bulkCreate(EXISTING_USERS);
    });

    afterAll(async () => {
        await db.sequelize.drop();
        await db.sequelize.close();
    });

    it('should return CREATED when create consumer', async () => {
        // GIVEN
        const token = await login(EXISTING_USERS[0]);
        const CONSUMER_TO_SAVE = {
            address: 'someAddress'
        };

        // WHEN
        const {body: createdConsumer, statusCode} = await testAPI(HTTP_METHODS.POST, URL, {token}).send(CONSUMER_TO_SAVE);

        // THEN
        expect(statusCode).toBe(CREATED);
        expect(createdConsumer).toMatchObject({
            userId: 1,
            ...CONSUMER_TO_SAVE
        });
    });

    it('should return OK & correct info when get a consumer', async () => {
        // GIVEN
        const token = await login(EXISTING_USERS[0]);
        const CONSUMER_TO_SAVE = {
            address: 'someAddress1'
        };
        const {body: createdConsumer} = await testAPI(HTTP_METHODS.POST, URL, {token}).send(CONSUMER_TO_SAVE);
        console.log('createdConsumer', createdConsumer)

        // WHEN
        const {body: actualConsumer, statusCode} = await testAPI(HTTP_METHODS.GET, `${URL}/${createdConsumer.id}`, {token}).send();

        // THEN
        console.log('actualConsumer', actualConsumer);
        expect(statusCode).toBe(OK);
        expect(actualConsumer).toMatchObject({
            userId: 1,
            ...CONSUMER_TO_SAVE
        });
    });
});
