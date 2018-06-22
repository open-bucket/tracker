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
            address: {
                type: Sequelize.STRING
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
            state: {
                type: Sequelize.ENUM(...Object.values(CONSUMER_STATES)),
                defaultValue: CONSUMER_STATES.INACTIVE
            },
            tier: {
                type: Sequelize.ENUM(...Object.values(CONSUMER_TIERS)),
                defaultValue: CONSUMER_TIERS.BASIC
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
