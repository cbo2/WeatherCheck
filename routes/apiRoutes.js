var db = require("../models");
var YQL = require('yql');
var yw = require('weather-yahoo');
var moment = require('moment');
moment().format();

var schedule = require('node-schedule');
 
var j = schedule.scheduleJob('03 * * * *', function(){
  console.log('this runs only on the 3rd minute of each hour!!!');
});

const DarkSky = require('dark-sky')
// const darksky = new DarkSky(process.env.DARK_SKY)
const darksky = new DarkSky("93d657f3bdf48bc91d9977b8e970f9dc")

darksky
    .latitude('41.8703')            // required: latitude, string || float.
    .longitude('-87.6236')            // required: longitude, string || float.
    .time(moment().subtract(0, 'days'))             // optional: date, string 'YYYY-MM-DD'.
    .units('us')                    // optional: units, string, refer to API documentation.
    .language('en')                 // optional: language, string, refer to API documentation.
    .exclude('minutely,currently,flags')      // optional: exclude, string || array, refer to API documentation.
    .extendHourly(true)             // optional: extend, boolean, refer to API documentation.
    .get()                          // execute your get request.
    .then((response) => {console.log(JSON.stringify(response))
    console.log("============> " + response.daily.data[0].humidity, response.daily.data[0].precipProbability)})
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

//   app.on('listening', function () {
//     var dailyTask = schedule.scheduleJob('0 0 * * *', function () {
//       console.log("======================= DAILY TASK RUNNER running at: " + moment().format() + " ======================");
//       db.UserProfile.findAll({}).then((users) => {
//         // console.log(JSON.stringify(users));
//         users.map((user) => { console.log(user.username); });
//       })
//       .catch(console.log);
//     });
// });  

  function checkWeatherInterval() {
    console.log("Checking the weather now....." + moment().format());
  }
  setInterval(checkWeatherInterval, 5000);

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

//For current day, get high, low, precipitation and hourly temp, humidity, and precipitation
function currentDay(){
  darksky
  .latitude('41.8703')            // required: latitude, string || float.
  .longitude('-87.6236')            // required: longitude, string || float.
  .time(moment().format("MMM Do YY"))             // optional: date, string 'YYYY-MM-DD'.
  .units('us')                    // optional: units, string, refer to API documentation.
  .language('en')                 // optional: language, string, refer to API documentation.
  .exclude('minutely,flags')      // optional: exclude, string || array, refer to API documentation.
  .get()                          // execute your get request.
  .then((response) => {
    console.log(
      "\n" + '---------------------------' +
      "\n" + "This is today's forecast!" +
      "\n" + "Today's high " + response.daily.data[0].temperatureHigh + 
      "\n" + "Today's low" + response.daily.data[0].temperatureLow +
      "\n" + "Chance of precipitation " + response.daily.data[0].precipProbability +
      "\n" + "Hourly temp " + response.hourly.data[].temperature + //Have a number loop inside the array from 0-23 to hit the hours and display the hourly temp automatically...maybe have Math.Floor the moment and output that number and push it into the array at the current time
      "\n" + "Hourly sensation " + response.hourly.data[0].apparentTemperature +
      "\n" + "Hourly humidity " + response.hourly.data[0].humidity +
      "\n" + "Hourly wind " + response.hourly.data[0].windSpeed + 
      "\n" + "Hourly  " + response.hourly.data[0].precipProbability
      
    );
  })
  .catch(console.log);  
}
// console.log(currentDay());


moment().format("H");
console.log("This is the current hour: " + moment().format("H"));