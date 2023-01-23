// Grab HTML elements
var cityHeader = $("#city-header");
var dateHeader = $("#date-header");
var dayCardsContainer = $("#day-cards-container");



// Main body of script

function getCityNameFromSearchBar() {
    var searchParam = document.location.search;
    if (searchParam) { // if search parameter is NOT empty or null
        var cityNameQuery = searchParam.substring(3);
    } else {
        console.log("Error: no search query. Normally this is impossible.")
    }
    console.log(cityNameQuery);
    searchApi(cityNameQuery);
}

function searchApi(cityName) {
    var queryUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&appid=af97bd5be6a8a1d925cf64d77d34d415";

    fetch(queryUrl)
    .then(function (response) {
        if (!response.ok) {
            throw response.json();
        }

        return response.json();
    })
    .then(function (results) {
        console.log(results); // print it just so I can see the headers in the console
        if (!results.length) { // if results has no length then search found nothing
            console.log("No results found!")
            cityHeader.text("No results found for \"" + cityName + "\"")
        } else {
            // store results
            var results = results[0];

            // place city name at top of weather section
            cityHeader.text(results.name + ", " + results.state + ", " + results.country);

            // get current date
            var currentDate = dayjs().format("MMM D, YYYY");
            var fiveDaysFromNow = dayjs().add(4, "day").format("MMM D, YYYY");
            dateHeader.text(currentDate + " — " + fiveDaysFromNow);
        }
    })
}

getCityNameFromSearchBar();