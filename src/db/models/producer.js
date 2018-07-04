const {PRODUCER_STATES} = require('../../enums');

module.exports = (sequelize, DataTypes) => {
    const Producer = sequelize.define('Producer', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.ENUM(...Object.values(PRODUCER_STATES)),
            defaultValue: PRODUCER_STATES.INACTIVE
        },
        address: {
            type: DataTypes.STRING,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    });

    Producer.associate = function (models) {
        Producer.belongsTo(models.User, {foreignKey: 'id'});
        Producer.belongsToMany(models.Shard, {
            through: 'ProducerShards',
            as: 'shards',
            foreignKey: 'producerId'
        });
    };

    return Producer;
};
