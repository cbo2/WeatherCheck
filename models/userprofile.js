module.exports = function(sequelize, DataTypes) {
  var UserProfile = sequelize.define("UserProfile", {
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.DECIMAL(11),
      allowNull: false
    },
    zipcode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    timePreference: {
      type: DataTypes.JSON
    }
  });
  return UserProfile;
};
