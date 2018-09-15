var db = require("../models");
var YQL = require('yql');
var yw = require('weather-yahoo');
var moment = require('moment');
moment().format();

var schedule = require('node-schedule');

var j = schedule.scheduleJob('03 * * * *', function () {
  console.log('this runs only on the 3rd minute of each hour!!!');
});

// this next scheduled task we be the once-per-day midnight workhorse 
// check this link for scheduling examples:  https://crontab.guru/every-night-at-midnight
var dailyTask = schedule.scheduleJob('0 0 * * *', function () {
  console.log("======================= DAILY TASK RUNNER running at: " + moment().format() + " ======================");
  db.UserProfile.findAll({}).then((users) => {
    // console.log(JSON.stringify(users));
    users.map((user) => { console.log(user.username); });
  })
  .catch(console.log);
});

// setInterval(() => {
// prototype adding a user to the system
db.UserProfile.create({
  username: "cbo",
  // timePreference: JSON.stringify({
  timePreference: {
    Sunday: "08:00",   // give the time as a simple string
    Monday: "06:30",
    Tuesday: moment.utc("06:30", "HH:mm").format("HH:mm"),  // or give the time as a moment's time (same thing)
    Wednesday: "06:30",
    Thursday: "06:30",
    Friday: "06:30",
    Saturday: "09:30"
  }
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
        console.log("---- User with name: " + queryUser.username + " has timepref on Wednesday of: " + queryUser.timePreference.Wednesday);
      })
  })
// }, 5000);  // we run the entire interval function 5 seconds after startup


const DarkSky = require('dark-sky')
// const darksky = new DarkSky(process.env.DARK_SKY)
const darksky = new DarkSky("93d657f3bdf48bc91d9977b8e970f9dc")

darksky
  .latitude('41.8703')            // required: latitude, string || float.
  .longitude('-87.6236')            // required: longitude, string || float.
  .time(moment().subtract(1, 'days'))             // optional: date, string 'YYYY-MM-DD'.
  .units('us')                    // optional: units, string, refer to API documentation.
  .language('en')                 // optional: language, string, refer to API documentation.
  .exclude('minutely,currently,flags')      // optional: exclude, string || array, refer to API documentation.
  .extendHourly(true)             // optional: extend, boolean, refer to API documentation.
  .get()                          // execute your get request.
  .then((response) => {
    console.log(JSON.stringify(response));
    return response;
  })
  .then((response) => { console.log("===> " + response.daily.data[0].humidity); return response; })
  .then((response) => {
    db.WeatherData.create({
      text: moment().subtract(1, 'days').toString(),
      description: response.daily.data[0].summary
    })
      .then(() => {
        console.log("== inserted row with date: " + moment().subtract(1, 'days'));
      });
  })
  .catch(console.log);





// app.use('/a-week-ago', async (req, res, next) => {
//   try {
//     const { latitude, longitude } = req.body
//     const forecast = await darksky
//       .options({
//         latitude,
//         longitude,
//         time: moment().subtract(1, 'weeks')
//       })
//       .get()
//     res.status(200).json(forecast)
//   } catch (err) {
//     next(err)
//   }
// });

module.exports = function (app) {
  // Get all examples
  app.get("/api/login", function (req, res) {
    console.log("hit the get route for /api/login with body of: " + req.body);
    db.Example.findAll({}).then(function (dbExamples) {
      res.json(dbExamples);
    });
  });

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

  function checkWeatherInterval() {
    console.log("Checking the weather now....." + moment().format());
  }
  setInterval(checkWeatherInterval, 300000);  // 5 minutes

  app.get("/api/getWeather", function (req, res) {
    console.log("hit the get route /api/getWeather with body: " + req.body);

    yw.getSimpleWeather('60605').then(function (response) {
      console.log(response);
      res.json(response);
    });

    // var query = new YQL('select * from weather.forecast where (location = 94089)');

    // query.exec(function(err, data) {
    //   if (err) { console.log("ERROR: " + err);}
    //   console.log(JSON.stringify(data));
    // var location = data.query.results.channel.location;
    // var condition = data.query.results.channel.item.condition;

    // console.log('The current weather in ' + location.city + ', ' + location.region + ' is ' + condition.temp + ' degrees.');
    // });
  });
};
