module.exports = (sequelize, DataTypes) => {
    const Consumer = sequelize.define('Consumer', {
        address: DataTypes.STRING,
        key: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
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
