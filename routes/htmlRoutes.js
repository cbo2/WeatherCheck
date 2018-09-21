var db = require("../models");

module.exports = function (app) {
  // Load index page
  app.get("/", function (req, res) {
    // db.weather.findAll({}).then(function(dbExamples) {
    res.render("index", {
      msg: "Weather Check✔️",
      title: "Sign up for daily text messages for the weather of the day.",
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

  app.get("/profile/:username", function (req, res) {
    console.log("hit the get route /profile with data: " + JSON.stringify(req.params.username));
    db.UserProfile.findOne({ where: { username: req.params.username } }).then(function (userdata) {
      res.render("profile", {
        msg: "Welcome ",
        user: userdata
      });
    });
  });

  app.get("/hourly/:zipcode", function (req, res) {
    console.log("hit the get route /hourly with data: " + JSON.stringify(req.params.zipcode));
    // TODO - at this point get the hourly data from dark-sky by doing a get to the api route:

    // app.get("/api/hourly/" + req.params.zipcode).then((response) => {
    res.render("hourly", {
      hourly: 
        [
          { "time": 1537333200, "summary": "Partly Cloudy", "icon": "partly-cloudy-night", "precipIntensity": 0.0015, "precipProbability": 0.01, "precipType": "rain", "temperature": 68.74, "apparentTemperature": 69.32, "dewPoint": 64.12, "humidity": 0.85, "pressure": 1014.97, "windSpeed": 4.15, "windGust": 5.16, "windBearing": 43, "cloudCover": 0.52, "uvIndex": 0, "visibility": 10, "ozone": 260.24 },
          { "time": 1537336800, "summary": "Partly Cloudy", "icon": "partly-cloudy-night", "precipIntensity": 0.002, "precipProbability": 0.02, "precipType": "rain", "temperature": 68.79, "apparentTemperature": 69.37, "dewPoint": 64.1, "humidity": 0.85, "pressure": 1014.92, "windSpeed": 6.13, "windGust": 7.61, "windBearing": 42, "cloudCover": 0.34, "uvIndex": 0, "visibility": 10, "ozone": 260.3 },
          { "time": 1537340400, "summary": "Partly Cloudy", "icon": "partly-cloudy-night", "precipIntensity": 0.0047, "precipProbability": 0.04, "precipType": "rain", "temperature": 68.73, "apparentTemperature": 69.3, "dewPoint": 64.01, "humidity": 0.85, "pressure": 1015.32, "windSpeed": 7.55, "windGust": 10.49, "windBearing": 41, "cloudCover": 0.27, "uvIndex": 0, "visibility": 10, "ozone": 259.96 },
          { "time": 1537344000, "summary": "Clear", "icon": "clear-night", "precipIntensity": 0.0058, "precipProbability": 0.04, "precipType": "rain", "temperature": 68.58, "apparentTemperature": 69.13, "dewPoint": 63.87, "humidity": 0.85, "pressure": 1015.52, "windSpeed": 8.1, "windGust": 11.93, "windBearing": 43, "cloudCover": 0.24, "uvIndex": 0, "visibility": 10, "ozone": 259.35 },
          { "time": 1537347600, "summary": "Clear", "icon": "clear-night", "precipIntensity": 0.0048, "precipProbability": 0.04, "precipType": "rain", "temperature": 68.11, "apparentTemperature": 68.66, "dewPoint": 63.73, "humidity": 0.86, "pressure": 1015.5, "windSpeed": 7.95, "windGust": 11.94, "windBearing": 49, "cloudCover": 0.23, "uvIndex": 0, "visibility": 10, "ozone": 259.13 },
          { "time": 1537351200, "summary": "Clear", "icon": "clear-night", "precipIntensity": 0.0063, "precipProbability": 0.04, "precipType": "rain", "temperature": 67.64, "apparentTemperature": 68.18, "dewPoint": 63.54, "humidity": 0.87, "pressure": 1015.67, "windSpeed": 7.97, "windGust": 12.41, "windBearing": 56, "cloudCover": 0.23, "uvIndex": 0, "visibility": 10, "ozone": 259.55 },
          { "time": 1537354800, "summary": "Clear", "icon": "clear-night", "precipIntensity": 0.0056, "precipProbability": 0.04, "precipType": "rain", "temperature": 67.27, "apparentTemperature": 67.8, "dewPoint": 63.34, "humidity": 0.87, "pressure": 1015.76, "windSpeed": 7.73, "windGust": 12.24, "windBearing": 64, "cloudCover": 0.24, "uvIndex": 0, "visibility": 10, "ozone": 260.32 },
          { "time": 1537358400, "summary": "Clear", "icon": "clear-day", "precipIntensity": 0.0062, "precipProbability": 0.04, "precipType": "rain", "temperature": 67.6, "apparentTemperature": 68.08, "dewPoint": 63.1, "humidity": 0.86, "pressure": 1015.84, "windSpeed": 7.35, "windGust": 11.33, "windBearing": 73, "cloudCover": 0.24, "uvIndex": 0, "visibility": 10, "ozone": 260.77 },
          { "time": 1537362000, "summary": "Clear", "icon": "clear-day", "precipIntensity": 0.0032, "precipProbability": 0.02, "precipType": "rain", "temperature": 68.88, "apparentTemperature": 69.33, "dewPoint": 63.18, "humidity": 0.82, "pressure": 1015.92, "windSpeed": 7.2, "windGust": 11.09, "windBearing": 83, "cloudCover": 0.24, "uvIndex": 1, "visibility": 10, "ozone": 260.58 },
          { "time": 1537365600, "summary": "Clear", "icon": "clear-day", "precipIntensity": 0.0007, "precipProbability": 0.01, "precipType": "rain", "temperature": 70.42, "apparentTemperature": 70.83, "dewPoint": 63.2, "humidity": 0.78, "pressure": 1016.09, "windSpeed": 7.39, "windGust": 10.55, "windBearing": 93, "cloudCover": 0.24, "uvIndex": 2, "visibility": 10, "ozone": 260.03 },
          { "time": 1537369200, "summary": "Clear", "icon": "clear-day", "precipIntensity": 0, "precipProbability": 0, "temperature": 71.96, "apparentTemperature": 72.36, "dewPoint": 63.36, "humidity": 0.74, "pressure": 1016.43, "windSpeed": 6.72, "windGust": 8.64, "windBearing": 98, "cloudCover": 0.24, "uvIndex": 3, "visibility": 10, "ozone": 259.48 },
          { "time": 1537372800, "summary": "Clear", "icon": "clear-day", "precipIntensity": 0, "precipProbability": 0, "temperature": 73.64, "apparentTemperature": 74.01, "dewPoint": 63.37, "humidity": 0.7, "pressure": 1016.52, "windSpeed": 6.05, "windGust": 7.23, "windBearing": 91, "cloudCover": 0.23, "uvIndex": 5, "visibility": 10, "ozone": 259.1 },
          { "time": 1537376400, "summary": "Clear", "icon": "clear-day", "precipIntensity": 0.0017, "precipProbability": 0.02, "precipType": "rain", "temperature": 75.2, "apparentTemperature": 75.56, "dewPoint": 63.45, "humidity": 0.67, "pressure": 1016.28, "windSpeed": 5.93, "windGust": 7.3, "windBearing": 74, "cloudCover": 0.21, "uvIndex": 6, "visibility": 10, "ozone": 258.74 },
          { "time": 1537380000, "summary": "Clear", "icon": "clear-day", "precipIntensity": 0, "precipProbability": 0, "temperature": 76.03, "apparentTemperature": 76.4, "dewPoint": 63.56, "humidity": 0.65, "pressure": 1015.89, "windSpeed": 5.81, "windGust": 7.27, "windBearing": 63, "cloudCover": 0.17, "uvIndex": 7, "visibility": 10, "ozone": 258.48 },
          { "time": 1537383600, "summary": "Partly Cloudy", "icon": "partly-cloudy-day", "precipIntensity": 0, "precipProbability": 0, "temperature": 77.77, "apparentTemperature": 78.22, "dewPoint": 64.26, "humidity": 0.63, "pressure": 1015.18, "windSpeed": 5.94, "windGust": 7.08, "windBearing": 62, "cloudCover": 0.28, "uvIndex": 6, "visibility": 10, "ozone": 258.29 },
          { "time": 1537387200, "summary": "Partly Cloudy", "icon": "partly-cloudy-day", "precipIntensity": 0.0004, "precipProbability": 0.04, "precipType": "rain", "temperature": 77.97, "apparentTemperature": 78.47, "dewPoint": 64.69, "humidity": 0.64, "pressure": 1014.74, "windSpeed": 6.73, "windGust": 7.62, "windBearing": 61, "cloudCover": 0.33, "uvIndex": 4, "visibility": 10, "ozone": 258.29 },
          { "time": 1537390800, "summary": "Partly Cloudy", "icon": "partly-cloudy-day", "precipIntensity": 0.0008, "precipProbability": 0.05, "precipType": "rain", "temperature": 77.55, "apparentTemperature": 78.08, "dewPoint": 65.08, "humidity": 0.66, "pressure": 1014.35, "windSpeed": 7.38, "windGust": 8.24, "windBearing": 64, "cloudCover": 0.39, "uvIndex": 2, "visibility": 10, "ozone": 258.32 },
          { "time": 1537394400, "summary": "Partly Cloudy", "icon": "partly-cloudy-day", "precipIntensity": 0.001, "precipProbability": 0.06, "precipType": "rain", "temperature": 76.43, "apparentTemperature": 77.01, "dewPoint": 65.41, "humidity": 0.69, "pressure": 1014.02, "windSpeed": 7.66, "windGust": 8.74, "windBearing": 66, "cloudCover": 0.44, "uvIndex": 1, "visibility": 10, "ozone": 258.35 },
          { "time": 1537398000, "summary": "Partly Cloudy", "icon": "partly-cloudy-day", "precipIntensity": 0.0016, "precipProbability": 0.07, "precipType": "rain", "temperature": 74.59, "apparentTemperature": 75.23, "dewPoint": 65.74, "humidity": 0.74, "pressure": 1013.75, "windSpeed": 7.8, "windGust": 9.41, "windBearing": 70, "cloudCover": 0.49, "uvIndex": 0, "visibility": 10, "ozone": 258.46 },
          { "time": 1537401600, "summary": "Partly Cloudy", "icon": "partly-cloudy-night", "precipIntensity": 0.002, "precipProbability": 0.07, "precipType": "rain", "temperature": 73.31, "apparentTemperature": 74.02, "dewPoint": 66.07, "humidity": 0.78, "pressure": 1013.57, "windSpeed": 7.99, "windGust": 10.48, "windBearing": 78, "cloudCover": 0.52, "uvIndex": 0, "visibility": 10, "ozone": 258.71 },
          { "time": 1537405200, "summary": "Partly Cloudy", "icon": "partly-cloudy-night", "precipIntensity": 0.0023, "precipProbability": 0.07, "precipType": "rain", "temperature": 72.55, "apparentTemperature": 73.32, "dewPoint": 66.42, "humidity": 0.81, "pressure": 1013.52, "windSpeed": 8.44, "windGust": 12.25, "windBearing": 92, "cloudCover": 0.56, "uvIndex": 0, "visibility": 10, "ozone": 259.19 },
          { "time": 1537408800, "summary": "Mostly Cloudy", "icon": "partly-cloudy-night", "precipIntensity": 0.0072, "precipProbability": 0.1, "precipType": "rain", "temperature": 72.43, "apparentTemperature": 73.24, "dewPoint": 66.77, "humidity": 0.82, "pressure": 1013.58, "windSpeed": 9.02, "windGust": 14.42, "windBearing": 111, "cloudCover": 0.6, "uvIndex": 0, "visibility": 10, "ozone": 259.73 },
          { "time": 1537412400, "summary": "Mostly Cloudy", "icon": "partly-cloudy-night", "precipIntensity": 0.0156, "precipProbability": 0.14, "precipType": "rain", "temperature": 72.61, "apparentTemperature": 73.46, "dewPoint": 67.06, "humidity": 0.83, "pressure": 1013.57, "windSpeed": 9.41, "windGust": 16.29, "windBearing": 125, "cloudCover": 0.63, "uvIndex": 0, "visibility": 10, "ozone": 259.79 },
          { "time": 1537416000, "summary": "Mostly Cloudy", "icon": "partly-cloudy-night", "precipIntensity": 0.0239, "precipProbability": 0.17, "precipType": "rain", "temperature": 72.79, "apparentTemperature": 73.66, "dewPoint": 67.22, "humidity": 0.83, "pressure": 1013.44, "windSpeed": 9.44, "windGust": 17.78, "windBearing": 132, "cloudCover": 0.66, "uvIndex": 0, "visibility": 10, "ozone": 258.86 }
        ]
    });
  });

};