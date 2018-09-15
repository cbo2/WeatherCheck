module.exports = function(sequelize, DataTypes) {
  var UserProfile = sequelize.define("UserProfile", {
    username:{
      type:DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: { 
      type:DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zipcode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timesunday: {
      type: DataTypes.STRING,
      // DATEONLY

    },
    timesunday: {
      type: DataTypes.STRING,
      // DATEONLY
    },
    timesunday: {
      type: DataTypes.STRING,
      // DATEONLY
    },
    timesunday: {
      type: DataTypes.STRING,
      // DATEONLY
    },
    timemonday: {
      type: DataTypes.STRING,
      // DATEONLY
    },
    timetuesday: {
      type: DataTypes.STRING,
      // DATEONLY
    },
    timewednesday: {
      type: DataTypes.STRING,
      // DATEONLY
    },
    timethursday: {
      type: DataTypes.STRING,
      // DATEONLY
    },
    timefriday: {
      type: DataTypes.STRING,
      // DATEONLY
    },
    timesaturday: {
      type: DataTypes.STRING,
      // DATEONLY
    },
  });
  return UserProfile;
};

/**
 * 
 * var timepreferences = {
 *  SUNDAY: 2:00pm,
 *  MONDAY: 3:00pm,
 *  TUESDAY: 3:00pm,
 *  WEDNESDAY: 4:00pm, 
 * }
 * 
 * 
 */
