module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('Shards', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            fileId: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'Files',
                    key: 'id'
                },
                onUpdate: 'cascade',
                onDelete: 'cascade'
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            hash: {
                type: Sequelize.STRING,
                allowNull: false
            },
            magnetURI: {
                type: Sequelize.STRING,
                allowNull: false
            },
            size: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            }
        });
    },
    down: (queryInterface) => {
        return queryInterface.dropTable('Shards');
    }
};
