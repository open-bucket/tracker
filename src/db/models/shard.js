module.exports = (sequelize, DataTypes) => {
    const Shard = sequelize.define('Shard', {
        fileId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        magnetURI: {
            type: DataTypes.STRING,
            allowNull: false
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
    });

    Shard.associate = function (models) {
        Shard.belongsTo(models.File, {foreignKey: 'id'});
    };

    return Shard;
};
