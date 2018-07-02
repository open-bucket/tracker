const {PRODUCER_STATES} = require('../../enums');

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Producers', {
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
                type: Sequelize.ENUM(...Object.values(PRODUCER_STATES)),
                defaultValue: PRODUCER_STATES.INACTIVE
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
    down: (queryInterface) => {
        return queryInterface.dropTable('Producers', {cascade: true});
    }
};
