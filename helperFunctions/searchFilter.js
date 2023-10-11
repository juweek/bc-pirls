import { toTitleCase } from './random.js';
import { sortList, sortDropdownHandler, getLastBenchmarkYPosition } from './sort.js';

/*
------------------------
METHOD: show all of the clicked buttons in a div. Have data be the master data where you check your data against, and currentlySelectedCountries is the abbreviated data that fits in with the rest of the filters
------------------------
*/
function showClicked(currentlySelectedCountries, data) {
  //clear out the current Search Bar results and populate it with the currentSelectedCountries.
  d3.select("#searchBarResults").selectAll("*").remove();
  d3.select("#searchBarResults")
    .selectAll("div")
    .data(currentlySelectedCountries)
    .enter()
    .append("div")
    .attr("id", function(d) {
      return "selectedCountry" + d;
    })
    .attr("class", "selectedCountry")
    .text(function(d) {
      return d;
    })

  //if currentlSelectedCountries is empty, hide the divs
  if (currentlySelectedCountries.length != 0) {
    //add a button at the end of the group that erases all of the selections
    d3.select("#searchBarResults")
      .append("div")
      .attr("id", "clearSelections")
      .text("RESET")
  }

  //attach a click event to the clear selections button
  d3.select("#clearSelections")
    .on("click", function() {
      console.log('this clearSelections is being fired')
      //clear out the current Search Bar results and populate it with the currentSelectedCountries.
      d3.selectAll('.chart').style('display', 'flex');
      d3.select("#searchBarResults").selectAll("*").remove();
      d3.selectAll('.chart').classed('low-opacity', false);
      d3.selectAll('.chart').classed('presentOnSearch', false);
      d3.selectAll('.resultButton').classed('resultButtonSelected', false);
      d3.select("#clearSelections").remove()
      d3.select('.dropdownMenu').dispatch('change');
    })
}

/*
------------------------
METHOD: create the results for the searchbar menu and handle w hen a button is clicked
------------------------
*/
function createSearchResults(data, searchValue, countriesList, searchBarResultsDiv) {
  //loop through the data and create a new array that only has the countries with the searchValue in them
  const countriesFromSearch = countriesList.filter(result => result.includes(searchValue.toLowerCase()));
  let html = '';

  //if the search inputValue is empty, then don't show the results and instead show 'no results'
  if (searchValue === '') {
    searchBarResultsDiv.innerHTML = '';
    return;
  }
  else if (countriesFromSearch == '') {
    searchBarResultsDiv.innerHTML = 'No results';
    return;
  }
  else {
    //sort through countriesFromSearch so the ones that start with the searchValue are at the top
    //change string to titleCase and create a new button for each matching result
    countriesFromSearch.sort((a, b) => {
      // Convert both strings to lower case
      let lowerA = a.toLowerCase();
      let lowerB = b.toLowerCase();
      let lowerSearchValue = searchValue.toLowerCase();

      // Check if a and b starts with the searchValue
      let aStartsWithSearchValue = lowerA.startsWith(lowerSearchValue);
      let bStartsWithSearchValue = lowerB.startsWith(lowerSearchValue);

      // If both a and b starts with searchValue, or neither do, sort alphabetically
      if (aStartsWithSearchValue === bStartsWithSearchValue) {
        return lowerA.localeCompare(lowerB);
      }

      // If a starts with searchValue, it should come first
      if (aStartsWithSearchValue) {
        return -1;
      }

      // If b starts with searchValue, it should come first
      if (bStartsWithSearchValue) {
        return 1;
      }
    });

    countriesFromSearch.forEach(result => {
      html += `<button class="resultButton" id="${toTitleCase(result)}" data-countryName="${toTitleCase(result)}">${toTitleCase(result)}</button>`;
    });

    // Update the searchResultsDiv with the new buttons in the html. create variables for the new HTML and the new button list
    searchBarResultsDiv.innerHTML = html;
    let selectedCountriesDiv = document.querySelectorAll('.selectedCountry');
    let currentCountriesInSearchResults = document.querySelectorAll('.resultButton');

    //for every button in searchBarResults, mark it gray if it already appears selected
    for (let i = 0; i < selectedCountriesDiv.length; i++) {
      let currentButtonID = selectedCountriesDiv[i].id.replace('selectedCountry', '');
      for (let j = 0; j < currentCountriesInSearchResults.length; j++) {
        if (currentButtonID == currentCountriesInSearchResults[j].id) {
          currentCountriesInSearchResults[j].classList.add('resultButtonSelected');
        }
      }
    }
  }
}


/*
------------------------
METHOD: create a function that sorts through the master data and removes all entries with Benchmark of a certain value
------------------------
*/
function removeBenchmark(data, benchmarkValue) {
  //loop through the data and remove all entries with the benchmarkValue
  for (let i = 0; i < data.length; i++) {
    if (data[i].Benchmark == benchmarkValue) {
      data.splice(i, 1);
      i--;
      //if the benchmarkValue is found, return the new data array
    }
  }
  return data;
}

export { showClicked, createSearchResults };