module.exports = (sequelize, DataTypes) => {
    const File = sequelize.define('File', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        consumerId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    });

    File.associate = function (models) {
        File.belongsTo(models.Consumer, {foreignKey: 'id'});
        File.hasMany(models.Shard, {foreignKey: 'fileId', as: 'shards'});
    };

    return File;
};
