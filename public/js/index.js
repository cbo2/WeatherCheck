//references to page elements
var $signUp = $("#sign-up");
var $logIn = $("#log-in");
var $newAcc = $("#newAcc");
var $saveUsr = $("#saveUsr");

//functions for clicks to render proper page

var handleSignUpClick = function () {
  $(this).attr("href", "/signup");
};

var handleSignInClick = function () {
  $(this).attr("href", "/profile");
};

var handleCreateAcc = function () {
  $(this).attr("href", "/profile");
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
  
  console.log(username, zipcode, phonenumber, allTimes);

  $.ajax("/api/profile", {
    type: "POST",
    data: {
      name: "Must set",
      password: "MustSet",
      username: username,
      zipcode: zipcode,
      phoneNumber: phonenumber,
      timePreference: allTimes
    }
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