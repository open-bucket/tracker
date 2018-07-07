const {CONSUMER_STATES, CONSUMER_TIERS} = require('../../enums');

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Consumers', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Users',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            state: {
                type: Sequelize.ENUM(...Object.values(CONSUMER_STATES)),
                defaultValue: CONSUMER_STATES.INACTIVE
            },
            tier: {
                type: Sequelize.ENUM(...Object.values(CONSUMER_TIERS)),
                defaultValue: CONSUMER_TIERS.BASIC
            },
            contractAddress: {
                type: Sequelize.STRING
            },
            address: {
                type: Sequelize.STRING
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    down: queryInterface => {
        return queryInterface.dropTable('Consumers', {cascade: true});
    }
};
