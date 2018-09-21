//references to page elements
var $signUp = $("#sign-up");
var $logIn = $("#log-in");
var $newAcc = $("#newAcc");
var $saveUsr = $("#saveUsr");

var API = {
  createNew: function (username, password) {
    console.log("We are here")
    return $.ajax("/api/createuser", {
      contentType: "application/json",
      data: JSON.stringify({
        username: username,
        password: password
      }),
      type: "POST"
    });
  },

  logIn: function (username, password) {
    console.log("Hello" + " " + username + " " + password);
    window.location.href = "/profile/" + username;
  }
};

//functions for clicks to render proper page

var handleSignUpClick = function () {
  $(this).attr("href", "/signup");
};

var handleSignInClick = function () {
  event.preventDefault();

  var username = $("#usrName").val();
  var password = $("#password").val();
  API.logIn(username, password);
};

var handleCreateAcc = function (event) {
  event.preventDefault();

  var username = $("#userName").val();
  var password = $("#password").val();

  API.createNew(username, password).then(function () {
    window.location.href = "/profile/" + username;
  });
};

var handleSaveUsr = function () {
  var username = $("#user").val();
  var zipcode = $("#zipcode").val();
  var phonenumber = $("#phoneNum").val();
  var allTimes = {
    Sunday: $("#timeInputSun").val(),
    Monday: $("#timeInputMon").val(),
    Tuesday: $("#timeInputTues").val(),
    Wednesday: $("#timeInputWed").val(),
    Thursday: $("#timeInputThur").val(),
    Friday: $("#timeInputFri").val(),
    Saturday: $("#timeInputSat").val()
  };
  var password = $("password").val();

  console.log(username, zipcode, phonenumber, allTimes);

  $.ajax("/api/profile", {
    type: "POST",
    data: JSON.stringify({
      name: "Must set",
      password: password,
      username: username,
      zipcode: zipcode,
      phoneNumber: phonenumber,
      timePreference: allTimes
    }),
    contentType: "application/json",
  }).then(function () {
    console.log("This User has been saved!");
    // location.reload();
  });
};

//when signup button is clicked
$signUp.on("click", handleSignUpClick);

//when log in button is clicked
$logIn.on("click", handleSignInClick);

$saveUsr.on("click", handleSaveUsr);

$newAcc.on("click", handleCreateAcc);