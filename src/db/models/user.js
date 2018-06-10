module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            unique: true
        },
        password: DataTypes.STRING
    }, {paranoid: true});


    User.associate = function (models) {
        // associations can be defined here
    };

    User.prototype.toJSON = function () {
        const obj = this.get();
        delete obj.password;
        return obj;
    };

    return User;
};
