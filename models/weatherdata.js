module.exports = function(sequelize, DataTypes) {
  var WeatherData = sequelize.define("WeatherData", {
    date: {
      type: DataTypes.DATEONLY
    },
    hightemp: {
      type: DataTypes.INTEGER(5)
    },
    lowtemp: {
      type: DataTypes.INTEGER(5)
    },
    precipitation: {
      type: DataTypes.FLOAT
    },
    wind: {
      type: DataTypes.FLOAT
    },
    zipcode: {
      type: DataTypes.DECIMAL(5)
    }
  });
  return WeatherData;
};
