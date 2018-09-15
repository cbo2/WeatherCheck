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
<<<<<<< HEAD
    phone: {
      type: DataTypes.STRING,
=======
    phoneNumber: {
      type: DataTypes.DECIMAL(11),
>>>>>>> 8c1335eb63e9b01223b47366d5519191f07eb682
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
