var db = require("../models");

module.exports = function (app) {
  // Load index page
  app.get("/", function (req, res) {
    // db.weather.findAll({}).then(function(dbExamples) {
    res.render("index", {
      msg: "Weather Check✔️",
      title: "Sign up for daily text messages for the weather of the day",
    });
    // });
  });

  // Load example page and pass in an example by id
  app.get("/login", function (req, res) {
    // db.weather.user({ where: { id: req.params.id } }).then(function (user) {
    res.render("login", {
      msg: "Welcome Back",
      title: "Please Log In"
    });
    // });
  });

  // Render 404 page for any unmatched routes
  app.get("*", function (req, res) {
    res.render("404");
  });
};
