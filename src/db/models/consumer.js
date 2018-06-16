module.exports = (sequelize, DataTypes) => {
    const Consumer = sequelize.define('Consumer', {
        address: DataTypes.STRING,
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    });

    Consumer.associate = function (models) {
        Consumer.belongsTo(models.User, { foreignKey: 'id' });
    };

    return Consumer;
};
