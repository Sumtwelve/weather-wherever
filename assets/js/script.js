$("#search-form").on("submit", function(event) {
    event.preventDefault();
    
    var searchInputVal = $("#city-search-bar").val();
    if (!searchInputVal) { // if search box is empty
        alert("Please enter a city.");
    } else {
        var queryString = "./search-results.html?q=" + searchInputVal;
        location.assign(queryString);
    }
});