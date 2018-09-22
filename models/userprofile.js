var bcrypt = require("bcrypt-nodejs");

module.exports = function (sequelize, DataTypes) {
  var UserProfile = sequelize.define("UserProfile", {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.DECIMAL(11),
      allowNull: true
    },
    zipcode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    timePreference: {
      type: DataTypes.JSON
    }
  });

  // Creating a custom method for our User model. This will check if an unhashed password entered by the user can be compared to the hashed password stored in our database
  UserProfile.prototype.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
  };
  // Hooks are automatic methods that run during various phases of the User Model lifecycle
  // In this case, before a User is created, we will automatically hash their password
  UserProfile.hook("beforeCreate", function (user) {
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10), null);
  });

  return UserProfile;
};
