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
    Tuesday: moment.utc("08:16", "HH:mm").format("HH:mm"),  // or give the time as a moment's time (same thing)
    Wednesday: "06:30",
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

db.UserProfile.create({
  username: "cbo2",
  // timePreference: JSON.stringify({
  timePreference: {
    Sunday: "10:28",   // give the time as a simple string
    Monday: "10:53",
    Tuesday: moment.utc("08:18", "HH:mm").format("HH:mm"),  // or give the time as a moment's time (same thing)
    Wednesday: "06:30",
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
var dailyTask = schedule.scheduleJob('15 * * * *', function () {
  console.log("======================= DAILY TASK RUNNER running at: " + moment().format() + " ======================");
  db.UserProfile.findAll({}).then((users) => {
    users.map((user) => {
      var today = moment().format('dddd');
      console.log("the value of today is: " + today);
      console.log("the value from the user for today is: " + user.timePreference[today]);
      var HHmmArray = user.timePreference[today].split(":");
      console.log("will schedule task for user at: " + HHmmArray);
      var scheduleDayTime = HHmmArray[1] + " " + HHmmArray[0] + " * * *";
      schedule.scheduleJob(scheduleDayTime, function (phoneNumber, zipcode) {
        client.messages.create({
          to: user.phoneNumber,
          from: '+16307915544', // Don't touch me!
          body: wiseWeatherWords(user.username),
        }),
          console.log("I am running for user with phoneNumber: " + phoneNumber);
        console.log("and will get weather information for this user using zipcode: " + zipcode);
      }.bind(null, user.phoneNumber, user.zipcode));
    })
  })
    .catch(console.log);
});

function wiseWeatherWords(id) {
  console.log("running wiseWeatherWords for user id: " + id);
  return "Hello " + username + " It's gonna be hot!!!";
}

// Dark Sky API Start-------------------------------------------------------------------------------------------------------
const DarkSky = require('dark-sky')
const darksky = new DarkSky(process.env.DARK_SKY)

darksky
  .latitude('41.8703')            // required: latitude, string || float.
  .longitude('-87.6236')            // required: longitude, string || float.
  .time(moment().subtract(0, 'days'))             // optional: date, string 'YYYY-MM-DD'.
  .units('us')                    // optional: units, string, refer to API documentation.
  .language('en')                 // optional: language, string, refer to API documentation.
  .exclude('minutely,currently,flags')      // optional: exclude, string || array, refer to API documentation.
  .extendHourly(true)             // optional: extend, boolean, refer to API documentation.
  .get()                          // execute your get request.
  .then((response) => {
    console.log(JSON.stringify(response)),
      console.log(
        "\n" + '---------------------------' +
        "\n" + "This is today's forecast!" +
        "\n" + "Today's high: " + response.daily.data[0].temperatureHigh +
        "\n" + "Today's low: " + response.daily.data[0].temperatureLow +
        "\n" + "Chance of precipitation: " + response.daily.data[0].precipProbability +
        "\n" + "Hourly temp: " + response.hourly.data[moment().format("H")].temperature +
        "\n" + "Hourly sensation: " + response.hourly.data[moment().format("H")].apparentTemperature +
        "\n" + "Hourly humidity: " + response.hourly.data[moment().format("H")].humidity +
        "\n" + "Hourly wind speed: " + response.hourly.data[moment().format("H")].windSpeed +
        "\n" + "Hourly chance of rain: " + response.hourly.data[moment().format("H")].precipProbability
      )
    return response;
  })
  // .then((response) => { console.log("===> " + response.daily.data[0].humidity); return response; })
  .then((response) => {
    db.WeatherData.create({
      date: moment().subtract(0, 'days'),
      hightemp: response.daily.data[0].temperatureHigh,
      lowtemp: response.daily.data[0].temperatureLow,
      precipitation: response.daily.data[0].precipProbability,
      wind: response.hourly.data[moment().format("H")].windSpeed,
      zipcode: response.hourly.data[moment().format("H")].windSpeed
    })
      .then(() => {
        console.log("== inserted row with date: " + moment().subtract(1, 'days'));
      });
  })
  .catch(console.log);
// Dark Sky API end-------------------------------------------------------------------------------------------------------------------


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
    console.log("hit the post route /api/profile with body: " + req.body);
    db.Example.create(req.body).then(function (dbExample) {
      res.json(dbExample);
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