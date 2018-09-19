var db = require("../models");
var moment = require('moment');
moment().format();
var schedule = require('node-schedule');

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

geocoder.geocode('60632', function (err, res) {
  console.log("********************* GEOCODE Start **********************");
  console.log("The latitude is: " + res[0].latitude);
  console.log("The longitude is: " + res[0].longitude);
  console.log("********************* GEOCODE End **********************");
});
// zipcode longitude/latitude converter stuff end--------------------------------------------------------------------------------

// Twilio Stuff------------------------------------------------------------------------------------------------------------------
var twilio = require('twilio');
require("dotenv").config();

var sid = process.env.TWILIO_SID;
var token = process.env.TWILIO_TOKEN;

console.log("the sid is: " + sid);
console.log("the token is: " + token);

db.UserProfile.create({
  username: "cbo",
  // timePreference: JSON.stringify({
  timePreference: {
    Sunday: "10:28",   // give the time as a simple string
    Monday: "10:53",
    Tuesday: moment.utc("00:03", "HH:mm").format("HH:mm"),  // or give the time as a moment's time (same thing)
    Wednesday: "11:09",
    Thursday: "06:30",
    Friday: "06:30",
    Saturday: "09:30"
  },
  password: "password",
  name: "craig",
  phoneNumber: 6309955170,
  phone: 6309955170,
  zipcode: 60605
})
  .then((returnedFromSequelize) => {
    console.log("== inserted row in userrpofile with: " + returnedFromSequelize);
    console.log("** today is a " + moment().format("dddd"));  // use moment to determine what kind of day today is
    return returnedFromSequelize;
  })
  .then((priorInsertResponse) => {
    db.UserProfile.findOne({ where: { id: priorInsertResponse.id } })
      .then((queryUser) => {
        // console.log("---- User with name: " + queryUser.username + " has timepref on Wednesday of: " + JSON.parse(queryUser.timePreference).Wednesday);
        console.log("---- User with name: " + queryUser.username + " has timepref on Monday of: " + queryUser.timePreference.Monday);
      })
  })

// db.UserProfile.create({
//   username: "cbo2",
//   // timePreference: JSON.stringify({
//   timePreference: {
//     Sunday: "10:28",   // give the time as a simple string
//     Monday: "10:53",
//     Tuesday: moment.utc("11:00", "HH:mm").format("HH:mm"),  // or give the time as a moment's time (same thing)
//     Wednesday: "10:56",
//     Thursday: "06:30",
//     Friday: "06:30",
//     Saturday: "09:30"
//   },
//   password: "password",
//   name: "craig",
//   phoneNumber: 6309955170,
//   phone: 6309955170,
//   zipcode: 60605
// })
//   .then((returnedFromSequelize) => {
//     console.log("== inserted row in userrpofile with: " + returnedFromSequelize);
//     console.log("** today is a " + moment().format("dddd"));  // use moment to determine what kind of day today is
//     return returnedFromSequelize;
//   })
//   .then((priorInsertResponse) => {
//     db.UserProfile.findOne({ where: { id: priorInsertResponse.id } })
//       .then((queryUser) => {
//         // console.log("---- User with name: " + queryUser.username + " has timepref on Wednesday of: " + JSON.parse(queryUser.timePreference).Wednesday);
//         console.log("---- User with name: " + queryUser.username + " has timepref on Monday of: " + queryUser.timePreference.Monday);
//       })
//   })

// Find your account sid and auth token in your Twilio account Console.
var client = new twilio(sid, token);

// Send the text message.
client.messages.create({
  to: '+16307915544',
  from: '+16307915544',
  body: "started running the node app at: " + moment().format() + " !!"
}).then((message) => console.log(message.sid))
  .catch(err => console.log(err));
// end Twilio Stuff---------------------------------------------------------------------------------------------------------

// This is the workhorse.  It will run a daily task at midnight and find all users in the database
// For each user it will discover their preferred notification time and fire a task to send them weather info at that time
// This function also needs to go to darksky and pull in the current day weather and put it into the db
// and purge out any weather data older than 5 days
var dailyTask = schedule.scheduleJob('08 * * * *', function () {
  console.log("**======================= DAILY TASK RUNNER running at: " + moment().format() + " ======================");
  var today = moment().format('dddd');
  purgeOldDataFromDB(today);
  db.UserProfile.findAll({}).then((users) => {
    users.map((user) => {
      get5DaysWeatherInDB(user.zipcode);
      console.log("the value of today is: " + today);
      console.log("the value from the user for today is: " + user.timePreference[today]);
      var HHmmArray = user.timePreference[today].split(":");
      console.log("will schedule task for user at: " + HHmmArray);
      var scheduleDayTime = HHmmArray[1] + " " + HHmmArray[0] + " * * *";
      try {
        schedule.scheduleJob(scheduleDayTime, function (username, phoneNumber, zipcode) {
          console.log("running for user id: " + username);
          // var weatherWisdom = wiseWeatherWords(username, zipcode).then(((wiz) => {
          wiseWeatherWords(username, zipcode).then((wiz) => {
            console.log("==> Got the weather wisdom of: " + wiz);
            // });
            console.log("Got the weather wisdom of: " + wiz);
            client.messages.create({
              to: user.phoneNumber,
              from: '+16307915544', // Don't touch me!
              body: wiz
            });
            console.log("I am running for user with phoneNumber: " + phoneNumber);
            console.log("and will get weather information for this user using zipcode: " + zipcode);
          });
        }.bind(null, user.username, user.phoneNumber, user.zipcode));
      } catch (error) { console.log("*************** ERROR!!!! **********" + error); }
    })
  })
    .catch(console.log);
});

// get the historical data from the db and generate an average high and average low.
// get the previous day from the historical data and see if it was wet/dry
// compare today's forecast to the avg high
// compate today's forecast to the avg low
// generate a string/comment saying if today will be WARMER or COOLER than avg (high and low)
// also, you can add to the string/comment whether to bring an umbrella based on precip for today (if greater than 25%)
function wiseWeatherWords(username, zip) {
  console.log("running wiseWeatherWords for user id: " + username);
  // return "Hello " + username + " It's gonna be hot!!!";

  var today = moment().format("YYYY-MM-DD");
  var priorDay = moment().subtract(1, 'days').format("YYYY-MM-DD");
  var numRows = 0;
  var sumHighs = 0;
  var sumLows = 0;
  var todayHigh = 0;
  var todayLow = 0;
  var todayPrecip;
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
        wisdom += "No umbrella needed";
      }
    }
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
            wind: response.hourly.data[moment().format("H")].windSpeed,
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

// Dark Sky API Start-------------------------------------------------------------------------------------------------------
const DarkSky = require('dark-sky')
const darksky = new DarkSky(process.env.DARK_SKY)

module.exports = function (app) {
  // Get all examples
  app.get("/api/login", function (req, res) {
    console.log("hit the get route for /api/login with body of: " + req.body);
    db.Example.findAll({}).then(function (dbExamples) {
      res.json(dbExamples);
    });
  });

  //Push Data into database
  app.post("/api/weatherdata", function (req, res) {
  })

  // Create a new profile
  app.post("/api/profile", function (req, res) {
    console.log("hit the post route /api/profile with body: " + JSON.stringify(req.body));
    console.log("Will get weather data in the database for this user: " + req.body.username + " with zipcode: " + req.body.zipcode);
    get5DaysWeatherInDB(req.body.zipcode);
    db.UserProfile.create(req.body).then(function (dbUser) {
      res.json(dbUser);
    });
  });


  // get a profile by id
  app.get("/api/profile/:id", function (req, res) {
    console.log("hit the get route /api/profile by id: " + req.params.id);
    db.Example.destroy({ where: { id: req.params.id } }).then(function (dbExample) {
      res.json(dbExample);
    });
  });

  // Delete an example by id
  app.delete("/api/profile/:id", function (req, res) {
    console.log("hit the delete route /api/profile by id: " + req.params.id);
    db.Example.destroy({ where: { id: req.params.id } }).then(function (dbExample) {
      res.json(dbExample);
    });
  });
}