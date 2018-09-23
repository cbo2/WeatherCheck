# Project Weather✔️

Group Name is:  Dothraki

## Technologies used
* NodeJS
* ExpressJS
* Twilio  (API used for sending SMS texting)
* dark-sky  (API used for supplying current and historical weather data)
* node-schedule  (API used to schedule background tasks at specified times - like crontab)
* nodd-geocoder (Google API being used to convert user input of zipcode to longitude/latitude required by dark-sky weather API)
* handlebars
* Sequelize
* passport authentication

to run with overrides:
NODE_ENV=development DB_PASSWORD=mypassword node server.js

branch with some integration examples to view on github (NOTE: this branch won't be merged to master):
cbo_prototype

## Challenges
* Since we are running background based timer tasks, got bit by heroku timezone.  Had to do this: heroku config:add TZ="America/Chicago"

