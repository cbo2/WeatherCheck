var schedule = require("node-schedule");

var j = schedule.scheduleJob("45 * * * *", function() {
  console.log("The answer to life, the universe, and everything!");
});

var e = schedule.scheduleJob("42 * * * *", function() {
  console.log("The answer to life, the universe, and everything!");
});

var t = schedule.scheduleJob("07 * * * *", function() {
  console.log("This is working flawlessly!!");
});

t.cancel(console.log("this job has been cancelled!!"));