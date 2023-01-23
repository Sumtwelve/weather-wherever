// Grab HTML elements
var searchInputBar = $("#city-search-bar");
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
    getCoords(cityNameQuery);
}

function getCoords(cityName) {
    // To get weather data by city name from OpenWeatherMap, we need
    // the coordinates of the city. We'll make one request for the coords,
    // and then use those coords to request the weather data.
    var coordsQueryUrl = "http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&appid=af97bd5be6a8a1d925cf64d77d34d415";

    fetch(coordsQueryUrl)
    .then(function (response) {
        if (!response.ok) {
            throw response.json();
        }

        return response.json();
    })
    .then(function (results) {
        if (!results.length) { // if results has no length then search found nothing
            console.log("No results found!")
            cityHeader.text("No results found for \"" + cityName + "\"")
        } else {
            console.log("City found: " + results[0].name); // print it just so I can see the headers in the console
            console.log(results);
            console.log("Lat: " + results[0].lat + "\nLon: " + results[0].lon);
            var lattitude = results[0].lat;
            var longitude = results[0].lon;
            getWeatherData(lattitude, longitude);
        }
    });
}

function getWeatherData(cityLat, cityLon) {
    var weatherQueryString = "https://api.openweathermap.org/data/2.5/forecast?lat=" + cityLat + "&lon=" + cityLon + "&appid=af97bd5be6a8a1d925cf64d77d34d415";

    fetch(weatherQueryString)
    .then(function (response) {
        if (!response.ok) {
            throw response.json();
        }

        return response.json();
    })
    .then(function (results) {
        if (results.length === 0) {
            console.log("No weather data results found for given coordinates.");
            dayCardsContainer.text("Error: weather data not found for given city's coordinates.");
        } else {
            console.log("Weather data results:");
            console.log(results);

            displayWeatherData(results);
        }
    });
}


function displayWeatherData(data) {
    // place city name at top of weather section
    var cityName = data.city.name;
    var cityCountry = data.city.country;
    cityHeader.text(cityName + ", " + cityCountry);
    
    // display forecast date range
    var currentDate = dayjs().format("MMM D, YYYY");
    var fiveDaysFromNow = dayjs().add(4, "day").format("MMM D, YYYY");
    dateHeader.text(currentDate + " — " + fiveDaysFromNow);

    
}


// Provide functionality to search bar. Exact same as on landing page.
$("#search-form").on("submit", function(event) {
    event.preventDefault();

    var searchInputVal = searchInputBar.val();
    if (!searchInputVal) { // if nothing was typed into the search box
        alert("Please enter a city.")
    } else {
        var queryString = "./search-results.html?q=" + searchInputVal;
        location.assign(queryString);
        console.log("wow");
    }
});

getCityNameFromSearchBar();