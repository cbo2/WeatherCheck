var db = require("../models");

module.exports = function(app) {
  // Load index page
  app.get("/", function(req, res) {
    // db.weather.findAll({}).then(function(dbExamples) {
    res.render("index", {
      msg: "Weather Check✔️",
      title: "Sign up for daily text messages for the weather of the day.",
      note: "Please log in if you have an account."
    });
    // });
  });

  app.post("/signup", function(req, res) {
    // db.weather.user({ where: { id: req.params.id } }).then(function (user) {
    res.render("create", {
      msg: "Welcome",
      title: "Please fill out information below to create a new account!"
    });
    // });
  });

  // app.get("/signin", function(req, res) {
  //   res.render("profile", {
  //     msg: "Welcome Back"
  //   });
  // });

  app.post("/profile", function (req, res) {
    res.render("profile", {
      msg: "Welcome Back"
    });
  });
};
