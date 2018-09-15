module.exports = function(sequelize, DataTypes) {
  var UserProfile = sequelize.define("UserProfile", {
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    phoneNumber: DataTypes.DECIMAL(11),
    timePreference: DataTypes.JSON
  });
  return UserProfile;
};
