module.exports = function(sequelize, DataTypes) {
  var UserProfile = sequelize.define("UserProfile", {
    text: DataTypes.STRING,
    description: DataTypes.TEXT
  });
  return UserProfile;
};
