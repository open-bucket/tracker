module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('ProducerShards', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            producerId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Producers',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            shardId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Shards',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
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
        return queryInterface.dropTable('ProducerShards');
    }
};
