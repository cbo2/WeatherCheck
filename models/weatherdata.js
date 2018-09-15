module.exports = function(sequelize, DataTypes) {
  var WeatherData = sequelize.define("WeatherData", {
    forecast: {
      text: DataTypes.STRING,
    },  
    zipcode: {
      type: DataTypes.STRING,
      
    },
    date: {
      type: DataTypes.DATEONLY,
    },
    hightemp: {
      type: DataTypes.STRING,
    },
    lowtemp: {
      type: DataTypes.STRING,
    },
    precipitation: {
      type: DataTypes.STRING,
    },
    wind: {
      type: DataTypes.STRING,
    } 
  });
  return WeatherData;
};