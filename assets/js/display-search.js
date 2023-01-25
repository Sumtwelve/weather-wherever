// Grab HTML elements
var searchInputBar = $("#city-search-bar");
var cityHeader = $("#city-header");
var currentDateHeader = $("#current-date-header");
var forecastDateHeader = $("#forecast-date-header");
var dayCardsContainer = $("#day-cards-container");



// Function Declarations Below


// Function takes query parameter from the URL bar at the top of the browser.
// There should only ever be one parameter, because only one is ever assigned,
// and assignation is the only way a user will normally get to this page.
function getCityNameFromSearchBar() {
    var searchParam = document.location.search;
    if (searchParam) { // if search parameter is NOT empty or null
        var cityNameQuery = searchParam.substring(3);
        return cityNameQuery;
    } else {
        // If user manages to get to search-results.html without a `?q=` in the URL bar,
        // then redirect to landing page to start the search process properly.
        console.log("Error: no search query in the URL bar.")
        cityHeader.text("Error: No search query detected. Redirecting to landing page...");
        setTimeout(function() {
            document.location.assign("./index.html");
        }, 3000);
        return;
    }    
}



// API call to OpenWeather's Geocoding API.
// Take a city name and return the coordinates. This is necessary because the API calls
// to get weather data take coordinates as input, not city name.
function getCoords(cityName) {

    var coordsQueryString = "http://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&appid=af97bd5be6a8a1d925cf64d77d34d415";

    fetch(coordsQueryString)
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
            return null;
        } else {
            console.log("City found: " + results[0].name);
            console.log(results); // print it just so I can see the headers in the console
            console.log("Lat: " + results[0].lat + "\nLon: " + results[0].lon);
            var latitude = results[0].lat;
            var longitude = results[0].lon;

            // place city and country into cityHeader
            // This is done here because the 
            cityHeader.text(results[0].name + ", " + results[0].country);

            getCurrentWeather(latitude, longitude);
            getForecast(latitude, longitude);
        }
    });
}


// Useful API links:
// Weather icons: https://openweathermap.org/weather-conditions


// Make API call to OpenWeather's "Current Weather Data" API, then display the data.
// Note that this is not a forecast. It is the current weather conditions for the area.
// API: https://openweathermap.org/current
function getCurrentWeather(lat, lon) {

    var weatherQueryString = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=af97bd5be6a8a1d925cf64d77d34d415"
    
    fetch(weatherQueryString)
    .then(function (response) {
        if (!response.ok) {
            throw response.json();
        }
        return response.json();
    })
    .then(function (results) {
        if (results.length === 0) {
            console.log("No weather data found for \'" + lat + ", " + lon + "\'");
            dateHeader.text("Error: No weather data avilable, or failed to retrieve it.")
        } else {
            console.log("Weather data results:")
            console.log(results);
            displayCurrentWeather(results);
        }
    });
}

function displayCurrentWeather(data) {
    // NOTE: 
    
    // display current date
    var currentDate = dayjs().format("MMM D, YYYY");
    currentDateHeader.text(currentDate);
    

    // DISPLAY CURRENT WEATHER CONDITIONS
    var weatherDeg = $("#current-weather-text");
    var weatherIcon = $("#current-weather-icon");

    // temperature data comes in degrees kelvin
    var tempK = data.main.temp;
    var tempF = fromKelvin(tempK, "f");
    var tempC = fromKelvin(tempK, "c");
    var temperature = (tempF + "°F (" + tempC + "°C)<br>");

    // wind speed data comes in kmph
    var windKMPH = data.wind.speed;
    var windMPH = toImperial(windKMPH, "km");
    var windSpeed = ("<strong>Wind speed:</strong> " + windMPH + " MPH (" + windKMPH + " KMPH)<br>")

    $("#current-weather-degrees").html(temperature);
    //TODO: after work 1/25: current weather needs to sit in a flex div
    // - Finish coralling and displaying the data, then focus on styling.
    // You're probably gonna have to abandon the temperature gradient idea.
    // Just style all the day cards white. (But if you have time, here's an idea
    // for a manual gradient: do it like how you "placed" a user based on their quiz score.)
    // - You might have to redesign the day cards. Adding and animating a blurb with new
    // content might take too much time, so just abandon the click functionality idea.
    // Make them each take their own line, make sure high and low temps are biggest.
}




// Make API call to OpenWeather's "5 Day / 3 Hour Forecast" API. Does not display data.
// Note that this is a forecast, so today's weather will not be present in the data.
// API: https://openweathermap.org/forecast5
function getForecast(lat, lon) {

    var forecastQueryString = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=af97bd5be6a8a1d925cf64d77d34d415";
    
    fetch(forecastQueryString)
    .then(function (response) {
        if (!response.ok) {
            throw response.json();
        }
        return response.json();
    })
    .then(function (results) {
        if (results.length === 0) {
            console.log("No forecast data found for \'" + lat + ", " + lon + "\'");
            dayCardsContainer.text("Error: No forecast data avilable, or failed to retrieve it.");
        } else {
            console.log("Forecast data results:");
            console.log(results);
            displayForecast(results);
        }
    });
}

// Display the data retrieved by getForecast().
function displayForecast(data) {

    var currentDate = dayjs().format("MMM D, YYYY");
    var fiveDaysFromNow = dayjs().add(4, "day").format("MMM D, YYYY");
    forecastDateHeader.text(currentDate + " — " + fiveDaysFromNow);

    for (var i = 0; i < 5; i++) {
        // Set day text (e.g. "Sun") and date text (e.g. "1/23")
        var day = dayjs().add(i+1, "day").format("ddd");
        var date = dayjs().add(i+1, "day").format("M/D")
        dayCardsContainer.children().eq(i).children().eq(0).text(day);
        dayCardsContainer.children().eq(i).children().eq(1).text(date);

        // Get degrees (high and low) for each day
        //var degHi = 

        // Extract icon href and set it to img tag

    }
}




function addToSearchHistory(query) {
    // TODO: display previous searches as <a> tags or buttons ig works too
}


function fromKelvin(degreesK, convertToUnit) {
    switch (convertToUnit.toLowerCase()) {
        case "f":
            return Math.trunc((degreesK - 273.15) * 9 / 5 + 32);
        case "c":
            return Math.trunc(degreesK - 273.15);
        default:
            console.log("ERROR: Invalid or unexpected argument `unit` for degree conversion.")
            return null;
    }
}

// Function to convert KM to MI, or M to FT
// NOTE that result is always truncated, fractional degrees will never be displayed
// on the website.
function toImperial(metricLength, metricUnit) {
    switch (metricUnit.toLowerCase()) {
        case "km":
            return Math.trunc(metricLength * 0.621371);
        case "m":
            return Math.trunc(metricLength * 3.28084);
    }
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
    }
});





// Start the program.
var cityName = getCityNameFromSearchBar();
var cityCoords = getCoords(cityName); // API call to find coordinates by city name
// once it has the coords, it will call getCurrentWeather() to display current weather data,
// and then getCurrentWeather() will call getForecast() to display forecast data