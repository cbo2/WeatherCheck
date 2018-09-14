module.exports = function(sequelize, DataTypes) {
  var UserProfile = sequelize.define("UserProfile", {
    username: DataTypes.STRING,
    timePreference: DataTypes.TEXT
  });
  return UserProfile;
};
