var db = require("../models");
var moment = require('moment');
moment().format();
const DarkSky = require('dark-sky')
const darksky = new DarkSky(process.env.DARK_SKY)
var schedule = require('node-schedule');
var passport = require("../config/passport");
var twilio = require('twilio');
require("dotenv").config();


// zipcode longitude/latitude converter stuff start----------------------------------------------------
var NodeGeocoder = require('node-geocoder');
var options = {
  provider: 'google',
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
      try {
        var oneUserTask = scheduleTaskForOneUser(user);
      } catch (error) { console.log("*************** ERROR!!!! **********" + error); }
    })
  })
    .catch(console.log);
});

// This function will be used to schedule and send a text for one user
function scheduleTaskForOneUser(user) {
  var today = moment().format('dddd');
  if (user.timePreference[today] === "") {
    return;  // user doesn't want a notification today, go to next user in uses.map() call
  }
  var HHmmArray = user.timePreference[today].split(":");
  var scheduleDayTime = HHmmArray[1] + " " + HHmmArray[0] + " * * " + today.substring(0, 3);  // use substring to abbreviate the day to 3 chars
  console.log("will schedule task for user at: " + scheduleDayTime);
  return schedule.scheduleJob(scheduleDayTime, userTask(user.username, user.phoneNumber, user.zipcode));
}

// this function is schduled for one user.  Since it is called by the node-scheduler (which requires a 
// function it will call, this function wraps itself interally with a function).  Otherwise, when 
// given to the node-scheduler it would fire right away instead of being scheduled at a time
var userTask = function (username, phoneNumber, zipcode) {
  return function () {
    console.log("running for user id: " + username);
    // var weatherWisdom = wiseWeatherWords(username, zipcode).then(((wiz) => {
    wiseWeatherWords(username, zipcode).then((wiz) => {
      client.messages.create({
        to: phoneNumber,
        from: '+16307915544', // Don't touch me!
        body: wiz
      });
    });
  }.bind(null, username, phoneNumber, zipcode);
}

// This is the function that performs the algorithm for sending out the weather wisdom.  Here is the logic:
//    Get the historical data from the db and generate an average high and average low.
//    Get the previous day from the historical data and see if it was wet/dry
//    Compare today's forecast to the avg high
//    Compate today's forecast to the avg low
//    Generate a comment saying if today will be WARMER or COOLER than trending avg days (high and low)
//    Generate a comment whether to bring an umbrella based on precip for today (if greater than 49%)
//    Or that you "may need" an umbrella based on precip for today (> 15% and less than 50%)
//    Generate a comment if it will be windy if wind speeds greatet than 15mph
//    As a curtosy, generate a link that will show detailed hourly weather data
function wiseWeatherWords(username, zip) {
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
    wisdom += process.env.BASE_URL + "hourly/" + zip + "\n";
    return wisdom;
  }).catch(console.log);
}

// We don't want to overwhelm storage in our database, so we will purge weather data older than 5 days from the DB
// It will be called daily by the midnight scheduler
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

// Get 5 days worth of historical weather data into the DB for a user's zip code.  This will be used by the 
// wisdom algorithm and will be readily available for that function so as not to slow it down.
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
            });
        })
        .catch(console.log);
    }  // end for loop
  });
}

// This function will generate the hourly weather data.  It is called by the wise weahter algorithm function
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
          hourlydata = response.hourly.data;  // this return will return it from the promise
          return hourlydata;
        })
        .catch(console.log);
    });
  }
}

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
      res.status(422).json(err.errors[0].message);
    });
  });

  //Push Data into database
  app.post("/api/weatherdata", function (req, res) {
  })

  // Create a new profile or update an existing profile
  // since these are combined, we need to handle the .create vs .update to sequelize
  app.post("/api/profile", function (req, res) {
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
      res.json(user);
    });
  });

  // this route is called when the user clicks on the link in their text message allowing them to view
  // hourly weather details.  This route will convert the zip code, get the hourly weather details, 
  // then post the data up the browser with handlebars
  app.get("/hourly/:zipcode", function (req, res) {
    geocoder.geocode(req.params.zipcode, function (err, geoResp) {
      if (err) {
        console.log("ERROR going to geocoder!!!!!!!!!!");
        throw new Error("ERROR going to geocoder!!!!!!!!!!");
      }
      var latitude = geoResp[0].latitude;
      var longitude = geoResp[0].longitude;

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

  // Delete a user by username
  app.delete("/api/profile/:username", function (req, res) {
    console.log("hit the delete route /api/profile by id: " + req.params.username);
    db.UserProfile.destroy({ where: { id: req.params.id } }).then(function (user) {
      res.json(user);
    });
  });
}