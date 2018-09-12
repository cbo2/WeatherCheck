module.exports = function(sequelize, DataTypes) {
  var WeatherData = sequelize.define("WeatherData", {
    text: DataTypes.STRING,
    description: DataTypes.TEXT
  });
  return WeatherData;
};