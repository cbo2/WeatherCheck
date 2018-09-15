var db = require("../models");

module.exports = function (app) {
  // Load index page
  app.get("/", function (req, res) {
    db.WeatherData.findAll({}).then(function (weatherData) {
      res.render("index", {
        msg: "Welcome!",
        weatherdata: weatherData
      });
    });
  });

  // Load example page and pass in a userprofile by userid
  app.get("/userprofile/:username", function (req, res) {
    db.UserProfile.findOne({ where: { username: req.params.username } }).then(function (userprofile) {
      console.log("============================   " + JSON.stringify(userprofile));
      res.render("userprofile", {
        profile: userprofile
      });
    });
  });

  // Load example page and pass in an example by id
  app.get("/weatherdata/:id", function (req, res) {
    db.WeatherData.findOne({ where: { id: req.params.id } }).then(function (weatherData) {
      res.render("weather", {
        weather: weatherData
      });
    });
  });

  // Render 404 page for any unmatched routes
  app.get("*", function (req, res) {
    res.render("404");
  });
};
