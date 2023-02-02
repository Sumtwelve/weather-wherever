// Grab HTML elements
var searchInputBar = $("#city-search-bar");
var cityHeader = $("#city-header");
var currentDateHeader = $("#current-date-header");
var forecastDateHeader = $("#forecast-date-header");
var dayCardsContainer = $("#day-cards-container");

// Intl.DisplayNames converts a country code into its full (English) name
// To use, use the `of` keyword:
// var countryName = englishName.of("IN");
const englishName = new Intl.DisplayNames(["en"], { type: "region" });


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

        // Current function executes on page load, so this is a perfect place to
        // refresh the search history section.
        displaySearchHistory();

        return;
    }    
}



// API call to OpenWeather's Geocoding API.
// Take a city name and return the coordinates. This is necessary because the API calls
// to get weather data take coordinates as input, not city name.
function getCoords(cityName) {

    // Display text that lets user know results are being fetched
    $("#city-header").text("Loading results...");

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
            cityHeader.text(results[0].name + ", " + englishName.of(results[0].country));

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
    var cityCurrentDate = dayjs.unix(data.dt).format("MMM D, YYYY");
    currentDateHeader.text(cityCurrentDate);
    

    // DISPLAY CURRENT WEATHER CONDITIONS

    // temperature data comes in degrees kelvin
    var tempK = data.main.temp;
    var tempF = fromKelvin(tempK, "f");
    var tempC = fromKelvin(tempK, "c");
    // assemble string and then display it
    var currentTemp = (tempF + "°F (" + tempC + "°C)");
    $("#current-weather-degrees").html(currentTemp);

    // get and display current weather ("cw") icon, set description as alt
    // note we get the 2x size version because I want it to be big
    var cwIconURL = "https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";
    $("#current-weather-icon").attr("src", cwIconURL);
    $("#current-weather-icon").attr("alt", data.weather[0].description);

    // get and display current weather conditions:
    // Feels Like (K), rain volume (mm), wind speed (m/s), and humidity (%)
    // 1. Weather description
    var cwDesc = data.weather[0].description;
    // 2. Rain and snow
    var currentRainDisplay = "";
    var currentSnowDisplay = "";
    if (data.rain) {
        // Rain data is under an object key called "1h". Javascript doesn't like that,
        // so I have to backdoor it out. Credit to StackOverflow user https://stackoverflow.com/users/1522816/grzegorz-kaczan
        // S.O. question: https://stackoverflow.com/questions/983267/how-to-access-the-first-property-of-a-javascript-object
        var currentRain = data.rain[Object.keys(data.rain)[0]];
        currentRainDisplay = "<strong>Rain: </strong>"
            + currentRain + "mm (" + toImperial(currentRain, "mm") + "in)<br>";
    }
    if (data.snow) {
        // To understand this, see comment on rain data above
        var currentSnow = data.snow[Object.keys(data.snow)[0]];
        currentSnowDisplay = "<strong>Snow: </strong>"
            + currentSnow + "mm (" + toImperial(currentSnow, "mm") + "in)<br>";
    }
    // 3. Feels Like
    var feelsLikeF = fromKelvin(data.main.feels_like, "f");
    var feelsLikeC = fromKelvin(data.main.feels_like, "c");
    // 4. Wind speed
    var windKMPH = data.wind.speed;
    var windMPH = toImperial(windKMPH, "km");
    // 5. Humidity
    var currentHumidity = data.main.humidity;
    // 6. Put it all together
    $("#current-weather-conditions").html(
        // place a span into the html to make weather description big and green :)
        "<strong><span class=\"h3\" style=\"color: green;\">" + cwDesc + "</span></strong>" +
        "<br>" +
        currentRainDisplay +
        currentSnowDisplay +
        "<i><strong>Feels Like: </strong></i>" + feelsLikeF + "°F (" + feelsLikeC + "°C)" +
        "<br>" +
        "<strong>Wind speed: </strong>" + windMPH + " MPH (" + windKMPH + " KMPH)" +
        "<br>" +
        "<strong>Humidity: </strong>" + currentHumidity + "%"
    );

    // set sunrise and sunset into final p tag
    var sunrise = dayjs.unix(data.sys.sunrise).format("h:mm A");
    var sunset = dayjs.unix(data.sys.sunset).format("h:mm A");
    $("#current-sunrise-sunset").html(
        "<strong>Sunrise: </strong>" + sunrise +
        " <strong>Sunset: </strong>" + sunset
    );
} // end of displayCurrentWeather()




//////////////////////////////////////////////////////////////////
///////////////////////// FORECAST BELOW /////////////////////////
//////////////////////////////////////////////////////////////////


// Make API call to OpenWeather's "5 Day / 3 Hour Forecast" API. Does not display data.
// Note that this is a forecast, so today's weather will not be present in the data.
// API: https://openweathermap.org/forecast5
function getForecast(lat, lon) {

    var forecastQueryString = "https://api.openweathermap.org/data/2.5/forecast/?lat=" + lat + "&lon=" + lon + "&appid=af97bd5be6a8a1d925cf64d77d34d415";
    
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

    $("#forecast-header").text("FORECAST");

    // Set forecast date range into forecast html header.
    // FIXME: These dates are unlinked from the forecast data. There may be discrepancies.
    var tomorrowDate = dayjs().add(1, "day").format("MMM D, YYYY");
    var fiveDaysFromNow = dayjs().add(5, "day").format("MMM D, YYYY");
    forecastDateHeader.text(tomorrowDate + " — " + fiveDaysFromNow);
    
    // Find the 3hr time block closest to the current hour. See comments above findHourBlock()
    // for a proper explanation.
    var currentHour = parseInt(dayjs().format("H"));
    var nearestTimeBlock = findHourBlock(currentHour);
    console.log("current hour: " + currentHour);
    console.log("nearest time block: " + nearestTimeBlock);

    // We're now going to access the forecast data.
    var count = 0; // will count the number of matching time blocks
    var tempHiF, tempHiC, tempLoF, tempLoC, weatherIconID, weatherIconURL; // the forecast data to display
    for (var i = 0; i < 40; i++) {
        var dtText = data.list[i].dt_txt; // holds human date as string, e.g. "2023-01-29 03:00:00"
        var dtHour = parseInt(dayjs(dtText).format("H")); // extract the hour
        //console.log(i + ": " + dtText + " // Hour: " + dtHour); // debug stuff

        // If weather data at this time block
        if (dtHour == nearestTimeBlock) {
            // debug stuff
            //console.log("FOUND A " + nearestTimeBlock + "!!!\n");
            console.log(data.list[i]);
            

            // extract data
            tempHiF = fromKelvin(data.list[i].main.temp_max, "f");
            tempLoF = fromKelvin(data.list[i].main.temp_min, "f");
            tempHiC = fromKelvin(data.list[i].main.temp_max, "c");
            tempLoC = fromKelvin(data.list[i].main.temp_min, "c");
            weatherIconID = data.list[i].weather[0].icon;
            weatherIconURL = "https://openweathermap.org/img/wn/" + weatherIconID + ".png";

            // SET DATA INTO CONTAINERS VIA THE `count` VARIABLE
            // 1. Store this forecast's date into a variable
            var forecastDay = dayjs().add(count+1, "day").format("ddd M/D");
            // 2. Build a string that matches the IDs of the corresponding cards
            var cardID = "#daycard-" + count;
            var cardDateID = "#daycard-" + count + "-date";
            var cardTextID = "#daycard-" + count + "-text"
            var cardIconID = "#daycard-" + count + "-img";
            // 3. Grab the html elements by those IDs
            var card = $(cardID);
            var cardDate = $(cardDateID);
            var cardText = $(cardTextID)
            var cardIcon = $(cardIconID);
            // 4. Set the data into the cards
            cardDate.text(forecastDay);
            cardText.html(
                "Hi: " + tempHiF + "°F (" + tempHiC + "°C)"
                + "<br>"
                + "Lo: " + tempLoF + "°F (" + tempLoC + "°C)"
            );
            cardIcon.attr("src", weatherIconURL);
            // 5. Style the cards. Note this is only done now that we can display their data.
            card.addClass("day-card");
            cardDate.addClass("day-card-date");
            cardText.css("color", "white");

            // Increment the counter for next time a current hour block is found
            count++;
        }
    }
    console.log("Found " + count + " " + nearestTimeBlock + "s in the forecast data.");
}




////////////////////////////////////////////////////////////////////////
///////////////////////// SEARCH HISTORY BELOW /////////////////////////
////////////////////////////////////////////////////////////////////////



// Function to add submitted city name query to localStorage.search-history.
// Note that this does not handle displaying it to the page, as that kind of function must be
// called every time the page is loaded, which would not be appropriate for this function here.
function addToSearchHistory(newEntry) {
    // TODO: display previous searches as <a> tags
    var searchHistory = JSON.parse(localStorage.getItem("search-history"));
    console.log("searchHistory before setting new entry:");
    console.log(searchHistory);

    if (!searchHistory[0]) {
        // If first element is null, that means the search-history array is newly initialized.
        // In this case we can just set the search item there instead of worrying about appending it.
        searchHistory[0] = newEntry;
        console.log("Set \"" + newEntry + "\" as first entry to localStorage.search-history.");
    } else {
        // If we reached this else then the search-history array is not new and already has items
        // set into it. So, we have to push to the array to avoid overwriting the search history.
        searchHistory.push(newEntry);
        console.log("Pushed \"" + newEntry + "\" to localStorage.search-history.");
    }

    // TODO: find a way to test this while loop, make sure it doesn't do anything crazy.
    // As of 1/28/2023 this bit here is UNTESTED but I don't see why it wouldn't work
    while (searchHistory.length > 5) {
        searchHistory.shift();
        console.log("Shifted \"" + searchHistory[0] + "\" outta here.\nsearchHistory now: " + searchHistory);
    }

    localStorage.setItem("search-history", JSON.stringify(searchHistory));
    console.log("Search history now:");
    console.log(JSON.parse(localStorage.getItem("search-history")));
}

// Function reads localStorage.search-history, creates a functional <a> tag for each element,
// then displays them under the search history div.
function displaySearchHistory() {
    // NOTE: I couldn't use jQuery here because I couldn't get it to set text into the <a> tags.
    // Instead of figuring out how to do that with jQuery, I switched over to vanilla JS.
    // And now I realize there probably is a way to do this with jQuery, but I can't be bothered
    // to switch it all back at this point.
    // TODO: figure out how to do this all with jQuery
    var historyDiv = document.getElementById("history-items-container");
    
    var searchHistory = JSON.parse(localStorage.getItem("search-history"));
    
    for (var i = 0; i < searchHistory.length; i++) {
        // If first element of localStorage.search-history is null, the array is new.
        // Put this check in to ensure page doesn't display blank <a> with a null href.
        if (searchHistory[0]) { // if first element is NOT null or empty
            var searchLink = document.createElement("a");
            searchLink.textContent = (searchHistory[i]);
            searchLink.setAttribute("class", "search-history-item");
            searchLink.setAttribute("href", ("?q=" + searchHistory[i]));
            // TODO: When you click on a history item, it should jump back up to the top of the list
            historyDiv.appendChild(searchLink);
        }
    }
}




/////////////////////////////////////////////////////////////////////////////
///////////////////////// ANCILLARY FUNCTIONS BELOW /////////////////////////
/////////////////////////////////////////////////////////////////////////////


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

// Function to convert KM to MI, M to FT, or MM to IN
// NOTE that result is always truncated, fractional degrees will never be displayed
// on the website.
function toImperial(metricLength, metricUnit) {
    switch (metricUnit.toLowerCase()) {
        case "km":
            return Math.trunc(metricLength * 0.621371);
        case "m":
            return Math.trunc(metricLength * 3.28084);
        case "mm":
            // Ensures rounding to 2 decimal places.
            // Code credit to Stack Overflow user https://stackoverflow.com/users/1575238/brian-ustas
            // in the answered question https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
            return Math.round((metricLength / 25.4) * 100) / 100;
        default:
            return null;
    }
}


// The forecast data is going to be a little difficult to work with. It takes your local time,
// then returns forecast data for the next five days, starting at about 12 hours into the future.
// It groups the forecast data into 3-hour blocks. Ideally, I would like to display forecasted
// weather as near to the current local time as possible (meaning if you look up the forecast
// Monday at 1:30pm, you'll see each forecasted day's weather for noon, the nearest block).
// To do that, a for loop in the displayForecast() function will check all 40 blocks in the data
// (5 days * 8 blocks per day = 40 total blocks), read the hour, and use the function below
// to find its nearest hour block.
function findHourBlock(hour) {
    switch (hour) {
        case 0:
        case 1:
        case 2: return 0;
        case 3:
        case 4:
        case 5: return 3;
        case 6:
        case 7:
        case 8: return 6;
        case 9:
        case 10:
        case 11: return 9;
        case 12:
        case 13:
        case 14: return 12;
        case 15: 
        case 16: 
        case 17: return 15;
        case 18:
        case 19:
        case 20: return 18;
        case 21:
        case 22:
        case 23: return 21;
        
        default: return null;
    }
}



//////////////////////////////////////////////////////////////////////////
///////////////////////// `MAIN` FUNCTIONS BELOW /////////////////////////
//////////////////////////////////////////////////////////////////////////


// Provide functionality to search bar. Exact same as on landing page.
$("#search-form").on("submit", function(event) {
    event.preventDefault();

    var searchInputVal = searchInputBar.val();
    if (!searchInputVal) { // if nothing was typed into the search box
        alert("Please enter a city.")
    } else {
        console.log("we gonna add to search history now");
        addToSearchHistory(searchInputVal);
        var queryString = "./search-results.html?q=" + searchInputVal;
        location.assign(queryString);
    }
});



// Check if the local storage entry is there. If not, initialize it.
// Note that I had to use the Array constructor, forcing JS to recognize it as an array
// and allowing me to use the .push() method (as seen in the addToSearchHistory() function above)
// NOTE ALSO that this does not need to be in this file. It's sufficient for it to be in script.js,
// but I'm keeping it here just to bug-proof it.
if (!localStorage.getItem("search-history")) {
    localStorage.setItem("search-history", JSON.stringify(new Array(1)));
}

// Access localStorage.search-history and build the user-facing Search History list from its contents.
// Note this has to happen every time the page loads, which is why I put it here.
displaySearchHistory();


// Start the program.
var cityName = getCityNameFromSearchBar();
var cityCoords = getCoords(cityName); // API call to find coordinates by city name.
// This starts a function chain: 
//                                     / 1. getCurrentWeather -> displayCurrentWeather
//                        getCoords --(
//                                     \ 2. getForecast -> displayForecast