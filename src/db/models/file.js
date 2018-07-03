'use strict'; 
module.exports = (sequelize, DataTypes) => { 
    var File = sequelize.define('File', { 
        name: { 
            type: DataTypes.STRING, 
            allowNull: false 
        }, 
        magnetUris:{ 
            type: DataTypes.JSONB, 
            allowNull: false 
        }, 
        consumerId: { 
            type: DataTypes.INTEGER, 
            allowNull: false 
        } 
    }, {}); 
    File.associate = function(models) { 
    // associations can be defined here 
        File.belongsTo(models.Consumer, { foreignKey: 'id' }); 
 
    }; 
    return File; 
};