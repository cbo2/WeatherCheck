var db = require("../models");

module.exports = function (app) {
  // Load index page
  app.get("/", function (req, res) {
    // db.weather.findAll({}).then(function(dbExamples) {
    res.render("index", {
      msg: "Weather Check✔️",
      title: "Sign up for daily out-the-door weather advise notifications",
      note: "Please log in if you have an account."
    });
    // });
  });

  app.post("/signup", function (req, res) {
    // db.weather.user({ where: { id: req.params.id } }).then(function (user) {
    res.render("create", {
      msg: "Welcome",
      title: "Please fill out information below to create a new account!"
    });
    // });
  });

  app.get("/signup", function (req, res) {
    // db.weather.user({ where: { id: req.params.id } }).then(function (user) {
    res.render("create", {
      msg: "Welcome",
      title: "Please fill out information below to create a new account!"
    });
    // });
  });

  app.get("/userlogin/:username", function (req, res) {
    console.log("hit the get route /userlogin with data: " + JSON.stringify(req.params.username));
    db.UserProfile.findOne({ where: { username: req.params.username } }).then(function (userdata) {
      res.render("profile", {
        msg: "Welcome Back",
        user: userdata
      });
    });
  });

  app.get("/profile", function (req, res) {
    console.log("Hitting the get route for /profile");
    res.render("profile", {
      msg: "Welcome Back",
      // user: { "id": "2", "username": "cbo2", "password": "password", "name": "craig", "phoneNumber": "6309955170", "zipcode": "90210", "timePreference[Friday]": "06:30", "timePreference[Monday]": "10:53", "timePreference[Sunday]": "10:28", "timePreference[Tuesday]": "11:00", "timePreference[Saturday]": "09:30", "timePreference[Thursday]": "09:48", "timePreference[Wednesday]": "10:56", "createdAt": "2018-09-21T00:12:05.000Z", "updatedAt": "2018-09-21T00:12:05.000Z" }
    });
  });

  app.post("/profile", function (req, res) {
    console.log("hit the post route /profile with data: " + JSON.stringify(req.body));
    db.UserProfile.findOne({ where: { username: req.body.username } }).then(function (userdata) {
      res.render("profile", {
        msg: "Welcome ",
        user: userdata
      });
    });
  });

  app.get("/profile/:username", function (req, res) {
    console.log("hit the get route /profile with data: " + JSON.stringify(req.params.username));
    db.UserProfile.findOne({ where: { username: req.params.username } }).then(function (userdata) {
      res.render("profile", {
        msg: "Welcome ",
        user: userdata
      });
    });
  });

};