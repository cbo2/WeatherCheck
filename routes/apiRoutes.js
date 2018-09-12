var db = require("../models");
var YQL = require('yql');
var yw = require('weather-yahoo');
var moment = require('moment');
moment().format();

const DarkSky = require('dark-sky')
// const darksky = new DarkSky(process.env.DARK_SKY)
const darksky = new DarkSky("93d657f3bdf48bc91d9977b8e970f9dc")

darksky
    .latitude('41.8703')            // required: latitude, string || float.
    .longitude('-87.6236')            // required: longitude, string || float.
    .time(moment().subtract(3, 'days'))             // optional: date, string 'YYYY-MM-DD'.
    .units('us')                    // optional: units, string, refer to API documentation.
    .language('en')                 // optional: language, string, refer to API documentation.
    .exclude('minutely,daily')      // optional: exclude, string || array, refer to API documentation.
    .extendHourly(true)             // optional: extend, boolean, refer to API documentation.
    .get()                          // execute your get request.
    .then(console.log)
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
  app.get("/api/examples", function (req, res) {
    db.Example.findAll({}).then(function (dbExamples) {
      res.json(dbExamples);
    });
  });

  // Create a new example
  app.post("/api/examples", function (req, res) {
    db.Example.create(req.body).then(function (dbExample) {
      res.json(dbExample);
    });
  });

  // Delete an example by id
  app.delete("/api/examples/:id", function (req, res) {
    db.Example.destroy({ where: { id: req.params.id } }).then(function (dbExample) {
      res.json(dbExample);
    });
  });

  function checkWeatherInterval() {
    console.log("Checking the weather now....." + moment().format());
  }
  setInterval(checkWeatherInterval, 5000);

  app.get("/api/getWeather", function (req, res) {


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
