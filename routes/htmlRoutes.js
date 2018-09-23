var db = require("../models");

module.exports = function (app) {
  // Load index page
  app.get("/", function (req, res) {
    res.render("index", {
      msg: "Weather Check✔️",
      title: "Sign up for daily out-the-door weather advise notifications",
      note: "Please log in if you have an account."
    });
    // });
  });

  app.post("/signup", function (req, res) {
    res.render("create", {
      msg: "Welcome",
      title: "Please fill out information below to create a new account!"
    });
    // });
  });

  app.get("/signup", function (req, res) {
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