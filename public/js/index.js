// Get references to page elements
var $exampleText = $("#example-text");
var $exampleDescription = $("#example-description");
var $submitBtn = $("#submit");
var $weatherList = $("#weatherdata-list");

// The API object contains methods for each kind of request we'll make
var API = {
  saveExample: function(example) {
    return $.ajax({
      headers: {
        "Content-Type": "application/json"
      },
      type: "POST",
      url: "api/examples",
      data: JSON.stringify(example)
    });
  },
  getWeather: function() {
    return $.ajax({
      url: "api/examples",
      type: "GET"
    });
  },
  getWeather: function() {
    return $.ajax({
      url: "api/getWeather",
      type: "GET"
    });
  },
  deleteExample: function(id) {
    return $.ajax({
      url: "api/examples/" + id,
      type: "DELETE"
    });
  }
};

// API.getWeather().then(function(data) {
//   console.log("hitting the api/getExamples to start a background interval");
// });

// refreshExamples gets new examples from the db and repopulates the list
var refreshExamples = function() {
  API.getWeather().then(function(data) {
    var $examples = data.map(function(weather) {
      var $a = $("<a>")
        .text(weather.text)
        .attr("href", "/weather/" + weather.id);

      var $li = $("<li>")
        .attr({
          class: "list-group-item",
          "data-id": weather.id
        })
        .append($a);

      var $button = $("<button>")
        .addClass("btn btn-danger float-right delete")
        .text("ｘ");

      $li.append($button);

      return $li;
    });

    $weatherList.empty();
    $weatherList.append($examples);
  });
};

// handleFormSubmit is called whenever we submit a new example
// Save the new example to the db and refresh the list
var handleFormSubmit = function(event) {
  event.preventDefault();

  var example = {
    text: $exampleText.val().trim(),
    description: $exampleDescription.val().trim()
  };

  if (!(example.text && example.description)) {
    alert("You must enter an example text and description!");
    return;
  }

  API.saveExample(example).then(function() {
    refreshExamples();
  });

  $exampleText.val("");
  $exampleDescription.val("");
};

// handleDeleteBtnClick is called when an example's delete button is clicked
// Remove the example from the db and refresh the list
var handleDeleteBtnClick = function() {
  var idToDelete = $(this)
    .parent()
    .attr("data-id");

  API.deleteExample(idToDelete).then(function() {
    refreshExamples();
  });
};

// Add event listeners to the submit and delete buttons
$submitBtn.on("click", handleFormSubmit);
$weatherList.on("click", ".delete", handleDeleteBtnClick);
