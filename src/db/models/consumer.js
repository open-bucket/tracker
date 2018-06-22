const {CONSUMER_STATES, CONSUMER_TIERS} = require('../../enums');

module.exports = (sequelize, DataTypes) => {
    const Consumer = sequelize.define('Consumer', {
        address: DataTypes.STRING,
        state: {
            type: DataTypes.ENUM(...Object.values(CONSUMER_STATES)),
            defaultValue: CONSUMER_STATES.INACTIVE
        },
        tier: {
            type: DataTypes.ENUM(...Object.values(CONSUMER_TIERS)),
            defaultValue: CONSUMER_TIERS.BASIC
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    });

    Consumer.associate = function (models) {
        Consumer.belongsTo(models.User, {foreignKey: 'id'});
    };

    return Consumer;
};
