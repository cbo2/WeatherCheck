var db = require("../models");
var moment = require('moment');
moment().format();
const DarkSky = require('dark-sky')
const darksky = new DarkSky(process.env.DARK_SKY)
var schedule = require('node-schedule');
var passport = require("../config/passport");
var twilio = require('twilio');
require("dotenv").config();


// zipcode longitude/latitude converter stuff start-----------------------------------------------------------------------------------
var NodeGeocoder = require('node-geocoder');
var options = {
  provider: 'google',

  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: process.env.GOOGLE_GEOCODE_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};
var geocoder = NodeGeocoder(options);

// Twilio Stuff------------------------------------------------------------------------------------------------------------------
var sid = process.env.TWILIO_SID;
var token = process.env.TWILIO_TOKEN;
var client = new twilio(sid, token);
// end Twilio Stuff---------------------------------------------------------------------------------------------------------

// This is the workhorse.  It will run a daily task at midnight and find all users in the database
// For each user it will discover their preferred notification time and fire a task to send them weather info at that time
// This function also needs to go to darksky and pull in the current day weather and put it into the db
// and purge out any weather data older than 5 days
var dailyTask = schedule.scheduleJob('0 0 * * *', function () {
  console.log("**======================= DAILY TASK RUNNER running at: " + moment().format() + " ======================");
  var today = moment().format('dddd');
  purgeOldDataFromDB(today);
  db.UserProfile.findAll({}).then((users) => {
    users.map((user) => {
      get5DaysWeatherInDB(user.zipcode);
      console.log("the value of today is: " + today);
      console.log("the value from the user for today is: " + user.timePreference[today]);
      // if (user.timePreference[today] === "") {
      //   console.log("******* the value for user: " + user.username + " does not want a notification on: " + today + "!  None will be scheduled!!");
      //   return;  // go to next user in uses.map() call
      // }
      // console.log("the value from the user for today is: " + user.timePreference[today]);
      // var HHmmArray = user.timePreference[today].split(":");
      // var scheduleDayTime = HHmmArray[1] + " " + HHmmArray[0] + " * * " + today.substring(0, 3);  // use substring to abbreviate the day to 3 chars
      // console.log("will schedule task for user at: " + scheduleDayTime);
      try {
        // schedule.scheduleJob(scheduleDayTime, function (username, phoneNumber, zipcode) {
        // var oneUserTask = schedule.scheduleJob(scheduleDayTime, userTask(user.username, user.phoneNumber, user.zipcode));
        // var oneUserTask = scheduleTaskForOneUser(scheduleDayTime, user.username, user.phoneNumber, user.zipcode);
        var oneUserTask = scheduleTaskForOneUser(user);
        // oneUserTask.bind(null, user.username, user.phoneNumber, user.zipcode);

        //     console.log("running for user id: " + username);
        //   // var weatherWisdom = wiseWeatherWords(username, zipcode).then(((wiz) => {
        //   wiseWeatherWords(username, zipcode).then((wiz) => {
        //     console.log("==> Got the weather wisdom of: " + wiz);
        //     // });
        //     console.log("Got the weather wisdom of: " + wiz);
        //     client.messages.create({
        //       to: user.phoneNumber,
        //       from: '+16307915544', // Don't touch me!
        //       body: wiz
        //     });
        //     console.log("I am running for user with phoneNumber: " + phoneNumber);
        //     console.log("and will get weather information for this user using zipcode: " + zipcode);
        //   });
        // }.bind(null, user.username, user.phoneNumber, user.zipcode));
      } catch (error) { console.log("*************** ERROR!!!! **********" + error); }
    })
  })
    .catch(console.log);
});

function scheduleTaskForOneUser(user) {
  var today = moment().format('dddd');
  if (user.timePreference[today] === "") {
    console.log("******* the value for user: " + user.username + " does not want a notification on: " + today + "!  None will be scheduled!!");
    return;  // go to next user in uses.map() call
  }
  console.log("the value from the user for today is: " + user.timePreference[today]);
  var HHmmArray = user.timePreference[today].split(":");
  var scheduleDayTime = HHmmArray[1] + " " + HHmmArray[0] + " * * " + today.substring(0, 3);  // use substring to abbreviate the day to 3 chars
  console.log("will schedule task for user at: " + scheduleDayTime);
  return schedule.scheduleJob(scheduleDayTime, userTask(user.username, user.phoneNumber, user.zipcode));
}

var userTask = function (username, phoneNumber, zipcode) {
  return function () {
    console.log("running for user id: " + username);
    // var weatherWisdom = wiseWeatherWords(username, zipcode).then(((wiz) => {
    wiseWeatherWords(username, zipcode).then((wiz) => {
      console.log("==> Got the weather wisdom of: " + wiz);
      // });
      console.log("Got the weather wisdom of: " + wiz);
      client.messages.create({
        to: phoneNumber,
        from: '+16307915544', // Don't touch me!
        body: wiz
      });
      console.log("I am running for user with phoneNumber: " + phoneNumber);
      console.log("and will get weather information for this user using zipcode: " + zipcode);
    });
  }.bind(null, username, phoneNumber, zipcode);
}

// get the historical data from the db and generate an average high and average low.
// get the previous day from the historical data and see if it was wet/dry
// compare today's forecast to the avg high
// compate today's forecast to the avg low
// generate a string/comment saying if today will be WARMER or COOLER than avg (high and low)
// also, you can add to the string/comment whether to bring an umbrella based on precip for today (if greater than 25%)
function wiseWeatherWords(username, zip) {
  console.log("running wiseWeatherWords for user id: " + username);

  var today = moment().format("YYYY-MM-DD");
  var priorDay = moment().subtract(1, 'days').format("YYYY-MM-DD");
  var numRows = 0;
  var sumHighs = 0;
  var sumLows = 0;
  var todayHigh = 0;
  var todayLow = 0;
  var todayPrecip;
  var todayWind = 0.0;
  var priorDayHigh = 0;
  var priorDayLow = 0;
  var wisdom = "Weather for: " + username + "\n";
  return db.WeatherData.findAll({
    where: {
      zipcode: zip
    }
  }).then((rows) => {
    rows.map((row) => {
      if (row.date === today) {
        todayHigh = row.hightemp;
        todayLow = row.lowtemp;
        todayPrecip = row.precipitation;
        todayWind = row.wind;
      } else {
        numRows++;
        sumHighs += row.hightemp;
        sumLows += row.lowtemp;
        if (row.date === priorDay) {
          priorDayHigh = row.hightemp;
          priorDayLow = row.lowtemp;
        }
      }
    })

    // start off by warning about wind if it is over 15mph
    wisdom += (todayWind > 15.0) ? "Windy with " : "";

    // wisdom regarding high temps
    wisdom += (todayHigh > (sumHighs / numRows)
      ? "Highs WARMER than trend\n" : "Highs COOLER than trend\n");
    if (todayHigh > (priorDayHigh * 1.10)) {  // more than 10% warmer high than yesterday
      wisdom += "Much warmer high than yesterday!\n";
    } else if (todayHigh < (priorDayHigh * .90)) {  // more than 10% cooler high than yesterday
      wisdom += "Much cooler high than yesterday!\n";
    } else {
      wisdom += "High temp not too different from yesterday!\n";
    }

    // wisdom regarding low temps
    wisdom += (todayLow > (sumLows / numRows)
      ? "Lows WARMER than trend\n" : "Lows COOLER than trend\n");
    if (todayLow < (priorDayLow * .90)) {  // more than 10% cooler low than yesterday
      wisdom += "Much cooler low than yesterday!\n";
    } else if (todayLow > (priorDayLow * 1.10)) {  // more than 10% warmer low than yesterday
      wisdom += "Much warmer low than yesterday!\n";
    } else {
      wisdom += "Low temp not too different from yesterday!\n";
    }

    // wisdom regarding precipitation
    if (todayPrecip > 0.49) {
      wisdom += "Bring your umbrella today!\n";
    } else {
      if (todayPrecip > 0.19) {
        wisdom += "May need your umbrella today\n";
      } else {
        wisdom += "No umbrella needed\n";
      }
    }
    wisdom += process.env.BASE_URL + "/hourly/" + zip + "\n";
    console.log("___----> wisdom is: " + wisdom);
    console.log("todays high: " + todayHigh + " and the average high: " + sumHighs / numRows);
    console.log("today's low: " + todayLow + " and the average low: " + sumLows / numRows);
    console.log("precip % today: " + todayPrecip);
    return wisdom;
  }).catch(console.log);
}

function purgeOldDataFromDB(today) {
  var purgeDate = moment().subtract(4, 'days').format("YYYY-MM-DD");
  db.WeatherData.destroy({
    where: {
      date: {
        lt: purgeDate
      }
    }
  }).then((result) => {
    console.log("== number of rows deleted: " + result);
  });
}

function get5DaysWeatherInDB(zip) {
  // first, convert zipcode to longitude/latitude
  var latitude;
  var longitude;
  geocoder.geocode(zip, function (err, res) {
    if (err) {
      console.log("ERROR going to geocoder!!!!!!!!!!");
      throw new Error("ERROR going to geocoder!!!!!!!!!!");
    }
    latitude = res[0].latitude;
    longitude = res[0].longitude;

    console.log("----------------- Getting 5 days weather for zip: " + zip + " and latitude: " + latitude + " and longitude: " + longitude + " -----------------------");

    for (let i = 4; i >= 0; i--) {
      darksky
        .latitude(latitude)            // required: latitude, string || float.
        .longitude(longitude)            // required: longitude, string || float.
        .time(moment().subtract(i, 'days'))             // optional: date, string 'YYYY-MM-DD'.
        .units('us')                    // optional: units, string, refer to API documentation.
        .language('en')                 // optional: language, string, refer to API documentation.
        .exclude('minutely,currently,flags')      // optional: exclude, string || array, refer to API documentation.
        .extendHourly(true)             // optional: extend, boolean, refer to API documentation.
        .get()                          // execute your get request.
        .then((response) => {
          console.log(">>>> the value of i is: " + i);
          db.WeatherData.create({
            date: moment.unix(response.daily.data[0].time).format("YYYY-MM-DD"),
            hightemp: response.daily.data[0].temperatureHigh,
            lowtemp: response.daily.data[0].temperatureLow,
            precipitation: response.daily.data[0].precipProbability,
            wind: response.hourly.data[moment().format("H")].windGust,
            zipcode: zip
          })
            .then((insertedRow) => {
              console.log("== inserted row with date: " + insertedRow.date);
              console.log("== inserted row with date: " + moment().subtract(i, 'days').format("YYYY-MM-DD") + " with i: " + i);
            });
        })
        .catch(console.log);
    }  // end for loop
  });
}

function getHourlyWeather(zip) {
  // first, convert zipcode to longitude/latitude
  var latitude;
  var longitude;
  var hourlydata;

  return function () {

    return geocoder.geocode(zip, function (err, res) {
      if (err) {
        console.log("ERROR going to geocoder!!!!!!!!!!");
        throw new Error("ERROR going to geocoder!!!!!!!!!!");
      }
      latitude = res[0].latitude;
      longitude = res[0].longitude;

      console.log("----------------- Getting hourly weather for zip: " + zip + " and latitude: " + latitude + " and longitude: " + longitude + " -----------------------");


      return darksky
        .latitude(latitude)            // required: latitude, string || float.
        .longitude(longitude)            // required: longitude, string || float.
        .time(moment().subtract(0, 'days'))             // optional: date, string 'YYYY-MM-DD'.
        .units('us')                    // optional: units, string, refer to API documentation.
        .language('en')                 // optional: language, string, refer to API documentation.
        .exclude('minutely,currently,flags')      // optional: exclude, string || array, refer to API documentation.
        .extendHourly(true)             // optional: extend, boolean, refer to API documentation.
        .get()                          // execute your get request.
        .then((response) => {
          console.log(">>>> hourly data is: " + JSON.stringify(response.hourly.data));

          hourlydata = response.hourly.data;  // this return will return it from the promise
          return hourlydata;
        })
        .catch(console.log);
    });
  }
}

// Dark Sky API Start-------------------------------------------------------------------------------------------------------


module.exports = function (app) {
  // Get all examples
  app.get("/api/login", function (req, res) {
    console.log("hit the get route for /api/login with body of: " + req.body);
    db.Example.findAll({}).then(function (dbExamples) {
      res.json(dbExamples);
    });
  });

  app.post("/api/createuser", function (req, res) {
    console.log("*********************>>>>>>>>>>>>>>>   hit the post route for /api/createuser with body of: " + JSON.stringify(req.body));
    db.UserProfile.create(req.body).then(function (dbUserCreated) {
      res.redirect(307, "/profile");
    }).catch(function (err) {
      console.log(err);
      res.json(err);
      // res.status(422).json(err.errors[0].message);
    });

  });

  //Push Data into database
  app.post("/api/weatherdata", function (req, res) {
  })

  // Create a new profile or update an existing profile
  // since these are combined, we need to handle the .create vs .update to sequelize
  app.post("/api/profile", function (req, res) {
    console.log("hit the post route /api/profile with body: " + JSON.stringify(req.body));
    console.log("Will get weather data in the database for this user: " + req.body.username + " with zipcode: " + req.body.zipcode);
    get5DaysWeatherInDB(req.body.zipcode);
    scheduleTaskForOneUser(req.body);

    db.UserProfile.findOne({ where: { username: req.body.username } }).then(function (foundItem) {
      if (!foundItem) {
        // Item not found, create a new one
        db.UserProfile.create(req.body)
          .then((dbUser) => {
            res.json(dbUser);
          }).catch((err) => {
            console.log("ERROR while creating user: " + req.body.username + " " + err);
          });
      } else {
        // Found an item, update it
        db.UserProfile.update(req.body, { where: { username: req.body.username } })
          .then((dbUser) => {
            res.json(dbUser);
          }).catch((err) => {
            console.log("ERROR while updating user: " + req.body.username + " " + err);
          });
      }
    });

    // db.UserProfile.create(req.body).then(function (dbUser) {
    //   res.json(dbUser);
    // });
  });

  // get a profile by id
  app.get("/api/hourly/:zipcode", function (req, res) {
    console.log("hit the get route /api/hourly with data: " + JSON.stringify(req.params.zipcode));

  });

  app.post("/api/userlogin", passport.authenticate("local"), function (req, res) {
    console.log("hit /api/login post route with data: " + JSON.stringify(req.body));
    // Since we're doing a POST with javascript, we can't actually redirect that post into a GET request
    // So we're sending the user back the route to the members page because the redirect will happen on the front end
    // They won't get this or even be able to access this page if they aren't authed
    res.json("/profile/" + req.body.username);
  });

  // get a profile by id
  app.get("/api/userlogin/:username", function (req, res) {
    console.log("hit the get route /api/userlogin with data: " + JSON.stringify(req.params.username));
    db.UserProfile.findOne({ where: { username: req.params.username } }).then(function (user) {
      console.log(JSON.stringify(user));
      res.json(user);
    });
  });

  app.get("/hourly/:zipcode", function (req, res) {
    console.log("hit the get route /hourly with data: " + JSON.stringify(req.params.zipcode));
    // TODO - at this point get the hourly data from dark-sky by doing a get to the api route:

    // var hourlydata = getHourlyWeather(req.params.zipcode);
    // console.log("============================ hourly data start ========================================");
    // console.log(JSON.stringify(hourlydata));
    // console.log("============================ hourly data end ==========================================");
    // app.get("/api/hourly/" + req.params.zipcode).then((response) => {

    geocoder.geocode(req.params.zipcode, function (err, geoResp) {
      if (err) {
        console.log("ERROR going to geocoder!!!!!!!!!!");
        throw new Error("ERROR going to geocoder!!!!!!!!!!");
      }
      var latitude = geoResp[0].latitude;
      var longitude = geoResp[0].longitude;

      console.log("----------------- Getting hourly weather for zip: " + req.params.zipcode + " and latitude: " + latitude + " and longitude: " + longitude + " -----------------------");


      darksky
        .latitude(latitude)            // required: latitude, string || float.
        .longitude(longitude)            // required: longitude, string || float.
        .time(moment().subtract(0, 'days'))             // optional: date, string 'YYYY-MM-DD'.
        .units('us')                    // optional: units, string, refer to API documentation.
        .language('en')                 // optional: language, string, refer to API documentation.
        .exclude('minutely,currently,flags')      // optional: exclude, string || array, refer to API documentation.
        .extendHourly(true)             // optional: extend, boolean, refer to API documentation.
        .get()                          // execute your get request.
        .then((response) => {
          console.log(">>>> hourly data is: " + JSON.stringify(response.hourly.data));

          hourlydata = response.hourly.data;  // this return will return it from the promise
          return hourlydata;
        })
        .then((hourlys) => {
          res.render("hourly", {
            hourly: hourlys,
            zip: req.params.zipcode
          })
        })
        .catch(console.log);
    });
  });





  // res.render("hourly", {
  //   hourly: hourlydata

  // [
  //   { "time": 1537333200, "summary": "Partly Cloudy", "icon": "partly-cloudy-night", "precipIntensity": 0.0015, "precipProbability": 0.01, "precipType": "rain", "temperature": 68.74, "apparentTemperature": 69.32, "dewPoint": 64.12, "humidity": 0.85, "pressure": 1014.97, "windSpeed": 4.15, "windGust": 5.16, "windBearing": 43, "cloudCover": 0.52, "uvIndex": 0, "visibility": 10, "ozone": 260.24 },
  //   { "time": 1537336800, "summary": "Partly Cloudy", "icon": "partly-cloudy-night", "precipIntensity": 0.002, "precipProbability": 0.02, "precipType": "rain", "temperature": 68.79, "apparentTemperature": 69.37, "dewPoint": 64.1, "humidity": 0.85, "pressure": 1014.92, "windSpeed": 6.13, "windGust": 7.61, "windBearing": 42, "cloudCover": 0.34, "uvIndex": 0, "visibility": 10, "ozone": 260.3 },
  //   { "time": 1537340400, "summary": "Partly Cloudy", "icon": "partly-cloudy-night", "precipIntensity": 0.0047, "precipProbability": 0.04, "precipType": "rain", "temperature": 68.73, "apparentTemperature": 69.3, "dewPoint": 64.01, "humidity": 0.85, "pressure": 1015.32, "windSpeed": 7.55, "windGust": 10.49, "windBearing": 41, "cloudCover": 0.27, "uvIndex": 0, "visibility": 10, "ozone": 259.96 },
  //   { "time": 1537344000, "summary": "Clear", "icon": "clear-night", "precipIntensity": 0.0058, "precipProbability": 0.04, "precipType": "rain", "temperature": 68.58, "apparentTemperature": 69.13, "dewPoint": 63.87, "humidity": 0.85, "pressure": 1015.52, "windSpeed": 8.1, "windGust": 11.93, "windBearing": 43, "cloudCover": 0.24, "uvIndex": 0, "visibility": 10, "ozone": 259.35 },
  //   { "time": 1537347600, "summary": "Clear", "icon": "clear-night", "precipIntensity": 0.0048, "precipProbability": 0.04, "precipType": "rain", "temperature": 68.11, "apparentTemperature": 68.66, "dewPoint": 63.73, "humidity": 0.86, "pressure": 1015.5, "windSpeed": 7.95, "windGust": 11.94, "windBearing": 49, "cloudCover": 0.23, "uvIndex": 0, "visibility": 10, "ozone": 259.13 },
  //   { "time": 1537351200, "summary": "Clear", "icon": "clear-night", "precipIntensity": 0.0063, "precipProbability": 0.04, "precipType": "rain", "temperature": 67.64, "apparentTemperature": 68.18, "dewPoint": 63.54, "humidity": 0.87, "pressure": 1015.67, "windSpeed": 7.97, "windGust": 12.41, "windBearing": 56, "cloudCover": 0.23, "uvIndex": 0, "visibility": 10, "ozone": 259.55 },
  //   { "time": 1537354800, "summary": "Clear", "icon": "clear-night", "precipIntensity": 0.0056, "precipProbability": 0.04, "precipType": "rain", "temperature": 67.27, "apparentTemperature": 67.8, "dewPoint": 63.34, "humidity": 0.87, "pressure": 1015.76, "windSpeed": 7.73, "windGust": 12.24, "windBearing": 64, "cloudCover": 0.24, "uvIndex": 0, "visibility": 10, "ozone": 260.32 },
  //   { "time": 1537358400, "summary": "Clear", "icon": "clear-day", "precipIntensity": 0.0062, "precipProbability": 0.04, "precipType": "rain", "temperature": 67.6, "apparentTemperature": 68.08, "dewPoint": 63.1, "humidity": 0.86, "pressure": 1015.84, "windSpeed": 7.35, "windGust": 11.33, "windBearing": 73, "cloudCover": 0.24, "uvIndex": 0, "visibility": 10, "ozone": 260.77 },
  //   { "time": 1537362000, "summary": "Clear", "icon": "clear-day", "precipIntensity": 0.0032, "precipProbability": 0.02, "precipType": "rain", "temperature": 68.88, "apparentTemperature": 69.33, "dewPoint": 63.18, "humidity": 0.82, "pressure": 1015.92, "windSpeed": 7.2, "windGust": 11.09, "windBearing": 83, "cloudCover": 0.24, "uvIndex": 1, "visibility": 10, "ozone": 260.58 },
  //   { "time": 1537365600, "summary": "Clear", "icon": "clear-day", "precipIntensity": 0.0007, "precipProbability": 0.01, "precipType": "rain", "temperature": 70.42, "apparentTemperature": 70.83, "dewPoint": 63.2, "humidity": 0.78, "pressure": 1016.09, "windSpeed": 7.39, "windGust": 10.55, "windBearing": 93, "cloudCover": 0.24, "uvIndex": 2, "visibility": 10, "ozone": 260.03 },
  //   { "time": 1537369200, "summary": "Clear", "icon": "clear-day", "precipIntensity": 0, "precipProbability": 0, "temperature": 71.96, "apparentTemperature": 72.36, "dewPoint": 63.36, "humidity": 0.74, "pressure": 1016.43, "windSpeed": 6.72, "windGust": 8.64, "windBearing": 98, "cloudCover": 0.24, "uvIndex": 3, "visibility": 10, "ozone": 259.48 },
  //   { "time": 1537372800, "summary": "Clear", "icon": "clear-day", "precipIntensity": 0, "precipProbability": 0, "temperature": 73.64, "apparentTemperature": 74.01, "dewPoint": 63.37, "humidity": 0.7, "pressure": 1016.52, "windSpeed": 6.05, "windGust": 7.23, "windBearing": 91, "cloudCover": 0.23, "uvIndex": 5, "visibility": 10, "ozone": 259.1 },
  //   { "time": 1537376400, "summary": "Clear", "icon": "clear-day", "precipIntensity": 0.0017, "precipProbability": 0.02, "precipType": "rain", "temperature": 75.2, "apparentTemperature": 75.56, "dewPoint": 63.45, "humidity": 0.67, "pressure": 1016.28, "windSpeed": 5.93, "windGust": 7.3, "windBearing": 74, "cloudCover": 0.21, "uvIndex": 6, "visibility": 10, "ozone": 258.74 },
  //   { "time": 1537380000, "summary": "Clear", "icon": "clear-day", "precipIntensity": 0, "precipProbability": 0, "temperature": 76.03, "apparentTemperature": 76.4, "dewPoint": 63.56, "humidity": 0.65, "pressure": 1015.89, "windSpeed": 5.81, "windGust": 7.27, "windBearing": 63, "cloudCover": 0.17, "uvIndex": 7, "visibility": 10, "ozone": 258.48 },
  //   { "time": 1537383600, "summary": "Partly Cloudy", "icon": "partly-cloudy-day", "precipIntensity": 0, "precipProbability": 0, "temperature": 77.77, "apparentTemperature": 78.22, "dewPoint": 64.26, "humidity": 0.63, "pressure": 1015.18, "windSpeed": 5.94, "windGust": 7.08, "windBearing": 62, "cloudCover": 0.28, "uvIndex": 6, "visibility": 10, "ozone": 258.29 },
  //   { "time": 1537387200, "summary": "Partly Cloudy", "icon": "partly-cloudy-day", "precipIntensity": 0.0004, "precipProbability": 0.04, "precipType": "rain", "temperature": 77.97, "apparentTemperature": 78.47, "dewPoint": 64.69, "humidity": 0.64, "pressure": 1014.74, "windSpeed": 6.73, "windGust": 7.62, "windBearing": 61, "cloudCover": 0.33, "uvIndex": 4, "visibility": 10, "ozone": 258.29 },
  //   { "time": 1537390800, "summary": "Partly Cloudy", "icon": "partly-cloudy-day", "precipIntensity": 0.0008, "precipProbability": 0.05, "precipType": "rain", "temperature": 77.55, "apparentTemperature": 78.08, "dewPoint": 65.08, "humidity": 0.66, "pressure": 1014.35, "windSpeed": 7.38, "windGust": 8.24, "windBearing": 64, "cloudCover": 0.39, "uvIndex": 2, "visibility": 10, "ozone": 258.32 },
  //   { "time": 1537394400, "summary": "Partly Cloudy", "icon": "partly-cloudy-day", "precipIntensity": 0.001, "precipProbability": 0.06, "precipType": "rain", "temperature": 76.43, "apparentTemperature": 77.01, "dewPoint": 65.41, "humidity": 0.69, "pressure": 1014.02, "windSpeed": 7.66, "windGust": 8.74, "windBearing": 66, "cloudCover": 0.44, "uvIndex": 1, "visibility": 10, "ozone": 258.35 },
  //   { "time": 1537398000, "summary": "Partly Cloudy", "icon": "partly-cloudy-day", "precipIntensity": 0.0016, "precipProbability": 0.07, "precipType": "rain", "temperature": 74.59, "apparentTemperature": 75.23, "dewPoint": 65.74, "humidity": 0.74, "pressure": 1013.75, "windSpeed": 7.8, "windGust": 9.41, "windBearing": 70, "cloudCover": 0.49, "uvIndex": 0, "visibility": 10, "ozone": 258.46 },
  //   { "time": 1537401600, "summary": "Partly Cloudy", "icon": "partly-cloudy-night", "precipIntensity": 0.002, "precipProbability": 0.07, "precipType": "rain", "temperature": 73.31, "apparentTemperature": 74.02, "dewPoint": 66.07, "humidity": 0.78, "pressure": 1013.57, "windSpeed": 7.99, "windGust": 10.48, "windBearing": 78, "cloudCover": 0.52, "uvIndex": 0, "visibility": 10, "ozone": 258.71 },
  //   { "time": 1537405200, "summary": "Partly Cloudy", "icon": "partly-cloudy-night", "precipIntensity": 0.0023, "precipProbability": 0.07, "precipType": "rain", "temperature": 72.55, "apparentTemperature": 73.32, "dewPoint": 66.42, "humidity": 0.81, "pressure": 1013.52, "windSpeed": 8.44, "windGust": 12.25, "windBearing": 92, "cloudCover": 0.56, "uvIndex": 0, "visibility": 10, "ozone": 259.19 },
  //   { "time": 1537408800, "summary": "Mostly Cloudy", "icon": "partly-cloudy-night", "precipIntensity": 0.0072, "precipProbability": 0.1, "precipType": "rain", "temperature": 72.43, "apparentTemperature": 73.24, "dewPoint": 66.77, "humidity": 0.82, "pressure": 1013.58, "windSpeed": 9.02, "windGust": 14.42, "windBearing": 111, "cloudCover": 0.6, "uvIndex": 0, "visibility": 10, "ozone": 259.73 },
  //   { "time": 1537412400, "summary": "Mostly Cloudy", "icon": "partly-cloudy-night", "precipIntensity": 0.0156, "precipProbability": 0.14, "precipType": "rain", "temperature": 72.61, "apparentTemperature": 73.46, "dewPoint": 67.06, "humidity": 0.83, "pressure": 1013.57, "windSpeed": 9.41, "windGust": 16.29, "windBearing": 125, "cloudCover": 0.63, "uvIndex": 0, "visibility": 10, "ozone": 259.79 },
  //   { "time": 1537416000, "summary": "Mostly Cloudy", "icon": "partly-cloudy-night", "precipIntensity": 0.0239, "precipProbability": 0.17, "precipType": "rain", "temperature": 72.79, "apparentTemperature": 73.66, "dewPoint": 67.22, "humidity": 0.83, "pressure": 1013.44, "windSpeed": 9.44, "windGust": 17.78, "windBearing": 132, "cloudCover": 0.66, "uvIndex": 0, "visibility": 10, "ozone": 258.86 }
  // ]

  // });
  // });

  // Delete an example by id
  app.delete("/api/profile/:username", function (req, res) {
    console.log("hit the delete route /api/profile by id: " + req.params.username);
    db.UserProfile.destroy({ where: { id: req.params.id } }).then(function (user) {
      res.json(user);
    });
  });
}