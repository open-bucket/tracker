const {CONSUMER_STATES, CONSUMER_TIERS} = require('../../enums');

module.exports = (sequelize, DataTypes) => {
    const Consumer = sequelize.define('Consumer', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        state: {
            type: DataTypes.ENUM(...Object.values(CONSUMER_STATES)),
            defaultValue: CONSUMER_STATES.INACTIVE
        },
        tier: {
            type: DataTypes.ENUM(...Object.values(CONSUMER_TIERS)),
            defaultValue: CONSUMER_TIERS.BASIC
        },
        contractAddress: {
            type: DataTypes.STRING,
        },
        address: {
            type: DataTypes.STRING,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    });

    Consumer.associate = function (models) {
        Consumer.belongsTo(models.User, {foreignKey: 'id'});
        Consumer.hasMany(models.File, {foreignKey: 'consumerId'});
    };

    return Consumer;
};
