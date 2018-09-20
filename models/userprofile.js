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

  return UserProfile;
};
