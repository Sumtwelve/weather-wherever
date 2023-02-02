$("#search-form").on("submit", function(event) {
    event.preventDefault();
    
    var searchInputVal = $("#city-search-bar").val();
    if (!searchInputVal) { // if search box is empty
        alert("Please enter a city.");
    } else {
        addToSearchHistory(searchInputVal);
        var queryString = "./search-results.html?q=" + searchInputVal;
        location.assign(queryString);
    }
});

// Function to add submitted city name query to localStorage.search-history.
function addToSearchHistory(newEntry) {
    // TODO: display previous searches as <a> tags or buttons ig works too
    var searchHistory = JSON.parse(localStorage.getItem("search-history"));
    console.log("searchHistory before setting new entry:");
    console.log(searchHistory);

    if (searchHistory[0] == null) {
        // If first element is null, that means the search-history array was newly initialized.
        // In this case we can just set the item there instead of worrying about appending it.
        searchHistory[0] = newEntry;
        console.log("Set \"" + newEntry + "\" as first entry to localStorage.search-history.");
    } else {
        // If we reached this else then the search-history array is not new and already has items
        // set into it. So, we have to push to the array to avoid overwriting the search history.
        searchHistory.push(newEntry);
        console.log("Pushed \"" + newEntry + "\" to localStorage.search-history.");
    }

    if (searchHistory.length >= 6) {
        // limit search history to a max of 5 items.
        searchHistory.shift();
    }

    localStorage.setItem("search-history", JSON.stringify(searchHistory));
    console.log("Search history now:");
    console.log(JSON.parse(localStorage.getItem("search-history")));
}

// Check if the local storage entry is there. If not, initialize it.
// Note that I had to use the Array constructor, forcing JS to recognize it as an array
// and allowing me to use the .push() method (as seen in the addToSearchHistory() function above)
if (!localStorage.getItem("search-history")) {
    localStorage.setItem("search-history", JSON.stringify(new Array(1)));
}