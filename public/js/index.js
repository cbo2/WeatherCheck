//references to page elements
var $signUp = $("sign-up");
var $logIn = $("log-in");

//functions for clicks to render proper page

var handleSignUpClick = function() {
  $(this).attr("href", "/signup");
};

var handleSignInClick = function() {
  $(this).attr("href", "/profile");
};

//when signup button is clicked
$signUp.on("click", handleSignUpClick);

//when log in button is clicked
$logIn.on("click", handleSignInClick);