# Project Weather✔️

This application will allow a user to log in and set up a profile which would include registering their phone number and zipcode.  Based on profile preferences the user will then get weather wisdom words of the day sent as a text at the time of their choosing.  The weather information will generate a weather pattern to establish a baseline and then issue suggestions as to prepare for the day's weather.  It is intended to be used as an out-the-door prep for the day's weather.  

This is a multi-user application and as such it is designed to generate these out-the-door text messages for all users of the system on the time of each user's choosing.  This app will use a cron-like function to schedule delivery of the text messages and will use Twilio to send the message.  

## Technologies used
* NodeJS
* ExpressJS
* Twilio  (API used for sending SMS texting)
* dark-sky  (API used for supplying current and historical weather data)
* node-schedule  (API used to schedule background tasks at specified times - like crontab)
* node-geocoder (Google API being used to convert user input of zipcode to longitude/latitude required by dark-sky weather API)
* handlebars
* Sequelize
* passport authentication

to run with overrides:
NODE_ENV=development DB_PASSWORD=mypassword node server.js

branch with some integration examples to view on github (NOTE: this branch won't be merged to master):
cbo_prototype

## Challenges
* Since we are running background based timer tasks, got bit by heroku timezone.  Had to do this: heroku config:add TZ="America/Chicago"

