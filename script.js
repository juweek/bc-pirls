import { createCountryDivs, sidePanelButtonHandler } from './helperFunctions/sidePanel.js';
import { showClicked, createSearchResults } from './helperFunctions/searchFilter.js';
import { svgToJpegDownload } from './helperFunctions/takeScreenshot.js';
import { sortList, sortDropdownHandler, getLastBenchmarkYPosition } from './helperFunctions/sort.js';

/*
------------------------
METHOD: set the dimensions of the graph
------------------------
*/
var margin = { top: 10, right: 30, bottom: 0, left: 210 },
  width = 640 - margin.left - margin.right,
  height = 1320 - margin.top - margin.bottom;

/*
------------------------
METHOD: append the svg to the body
------------------------
  */
var svg = d3.select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

//select xAxisDiv element from the html page
var xAxisDiv = d3.select("#xAxisDiv");

/*
------------------------
METHOD: //select all the dropdowns 
------------------------
*/
var sortDropdown = d3.select("#sortDropdown");
var orderDropdown = d3.select("#orderDropdown");

/*
------------------------
METHOD: //detect the current browser you're using
------------------------
*/
if (navigator.userAgent.includes('Windows')) {
    document.body.classList.add('windows-os');
}

/*
------------------------
METHOD: create the d3 chart. set the y axis to the countries
------------------------
*/
function createChart(svg, data) {
  //clear out the svg,  set the height relative to the length of the data
  var width = svg.attr("width")
  var height = data.length * 30;
  svg.selectAll("*").remove();


  //change the height of the svg to the height of the data. IS THIS IMPOSSIBLE
  d3.select("#my_dataviz").style("height", (height + 40) + "px");
  d3.select("#my_dataviz svg").attr("height", height + 40);
  //svg.attr("height", height);

  //call the sortList function to sort the data
  var sortedData = sortList(data, "Benchmark", 'asc');

  // Remove the current x-axis element
  svg.select("#xAxis").remove();
  xAxisDiv.select("#xAxis2").remove();

  // Create a new x-axis element
  var x = d3.scaleLinear()
    .domain([0, 100])
    .range([0, width - 230]);

  // Append the second x-axis to the div element with id "xAxisDiv". make sure it matches the x and y of the first x-axis
  var xAxis2 = d3.axisBottom(x)
    .tickFormat(function (d) {
      return d === 0 ? '' : d + "%";
    });

  var gX = xAxisDiv.append("g")
    .attr("id", "xAxis2")
    .attr("transform", "translate(" + 210 + ",0)")
    .call(xAxis2);

  // Select all text within the xAxis2 and adjust their position
  gX.selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "1em")
    .attr("dy", "1em")
    .attr("font-family", "PT Sans")
    .attr("font-size", "11.5px")

  var domainArray = data.map(function (d) {
    return {
      country: d.Country,
      wave: d.Wave
    };
  });

  var graphData = [...data];  // Start with a copy of your original data
  var benchmarkIndex = data.findIndex(d => d.Benchmark == 1);  // Find the first benchmark country
  if (benchmarkIndex !== -1) {
    graphData.splice(benchmarkIndex, 0, { Country: "Benchmarking Participants" });  // Insert the placeholder at the correct position
  }
  // Y axis
  var y = d3.scaleBand()
    .range([-20, height + 10])
    .domain(graphData.map(function (d) { return d.Country; }))
    .padding(1);

  svg.append("g")
    .call(d3.axisLeft(y).tickValues(y.domain().filter(function (d) { return d !== "Benchmarking Participants"; })))
    .selectAll("text")
    .each(function (d) {
      var matchingObject = data.find(function (obj) {
        return obj.Country === d;
      });

      var fillColor = "black";  // default fill

      if (matchingObject) {
        if (matchingObject.Wave == 2) {
          fillColor = "#96557c";
        }

        if (matchingObject.Country.toLowerCase() === 'international median') {
          fillColor = "#990909"; // You might want to change this to a suitable color
        }
      }

      var rectHeight = 20;  // Our fixed height
      var gap = 0;  // Gap between bars, adjust to your needs

      // Draw rectangles before adding text. This will ensure that the rectangle appears behind the text.
      d3.select(this.parentNode)
        .insert("rect", "text")
        .attr("x", '-250px')
        .attr("y", -10) // Setting y based on index
        .attr("height", rectHeight + "px")
        .attr("width", '250px')
        .attr('class', 'yaxistextbar')
        .attr("fill", fillColor === "black" ? "white" : fillColor)
        .attr("opacity", 0.2);  // Lower the opacity

      // This refers to the SVG text element just created
      var text = d3.select(this);
      text.text(""); // clear existing text

      if (matchingObject && matchingObject.prefix && matchingObject.prefix.trim() !== '') {
        // Append a tspan for the prefix with different style
        var prefixText = text.append('tspan')
          .attr('dy', '-0.3em') // Adjusts the vertical position of the prefix
          .attr('font-size', '0.7em') // Makes the prefix smaller
          .style("font-family", "PT Sans")
          .text(matchingObject.prefix + " "); // add space after prefix

        // Append a tspan for the main text
        text.append('tspan')
          .text(d)
          .attr('dy', '0.5em') // Adjusts the vertical position of the prefix;
      } else {
        // If there's no prefix, just append the text as normal
        text.text(d);
      }
    })
    .style("text-anchor", "end")
    .attr('class', 'yAxisText')
    .style("font-family", "PT Sans")
    .style("fill", function (d) {
      var matchingObject = data.find(function (obj) {
        return obj.Country === d;
      });
      if (matchingObject && matchingObject.Wave == 2) {
        return "#96557c";
      } else {
        return "black";
      }
    });

  // Append a group to hold your line
  var yAxisLine = svg.append("g");

  // Append the line to the group
  yAxisLine.append("line")
    .attr("x1", 0)  // The line starts at x = 0
    .attr("y1", 0)  // The line starts at y = 0
    .attr("x2", 0)  // The line ends at x = 0 (so it's a vertical line)
    .attr("y2", height)  // The line ends at y = height
    .style("stroke", "black")  // Change this to your desired color
    .style("stroke-width", 2);  // Change this to your desired line thickness

  // Move the group to the right of the ticks
  yAxisLine.attr("transform", "translate(" + y.bandwidth() + ",0)");

  //create a loop that creates a vertical zebra background for the chart that alternates between grey and white every 10 points on the x axis
  var zebra = 0;
  for (var i = 0; i < 120; i++) {
    svg.append("rect")
      .attr("x", x(i))
      .attr("y", 0)
      .attr("width", x(10))
      .attr("height", height)
      .attr("fill", function () {
        if (zebra == 0) {
          zebra = 1;
          return "#F6F2F4";
        } else {
          zebra = 0;
          return "#fff";
        }
      });
    i = i + 9;
  }

  /*
------------------------
METHOD: show the tooltip wth the approrpiate info
------------------------
*/
  function showTooltip(d) {
    let currentCountry = d.Country;
    let currentLow = d.low;
    let currentIntermediate = d.intermediate;
    let currentAdvanced = d.advanced;
    let currentHigh = d.high;
    let tooltip = d3.select("#tooltip");

    tooltip.style("display", "block");
    //set the text of html to a summary of the data points
    tooltip.html(`<h3>${currentCountry}</h3>
            <p>Advanced Benchmark: ${Math.round(currentAdvanced)}%</p>
            <p>High Benchmark: ${Math.round(currentHigh)}%</p>
            <p>Intermediate Benchmark: ${Math.round(currentIntermediate)}%</p>
            <p>Low Benchmark: ${Math.round(currentLow)}%</p>`)
    tooltip.style("left", (d3.event.pageX + 10) + "px")
    tooltip.style("top", (d3.event.pageY - 40) + "px")
    tooltip.style("opacity", 1);
    //remove 'active' from all line elements, then add 'active' to the current line element not using classed
    svg.selectAll(".lineChartElement").classed("active", false);
    let currentLine = event.target;
    currentLine.classList.add("active");
  }

  function hideTooltip(d) {
    svg.selectAll(".lineChartElement").classed("active", false);
  }

  //give each line a tooltip
  svg.selectAll("myline")
    .data(data)
    .enter()
    .append("line")
    .attr("x1", function (d) { return x(d.advanced); })
    .attr("x2", function (d) { return x(d.low); })
    .attr("y1", function (d) { return y(d.Country); })
    .attr("y2", function (d) { return y(d.Country); })
    .attr("class", "lineChartElement")
    .attr("data-wave", function (d) { return d.Wave })
    .attr("stroke-width", "2.3px")
    .style("stroke", "black")
    .on("mouseenter", showTooltip)
    .on("mouseleave", hideTooltip);

  // Circles of advanced
  svg.selectAll("mycircle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.advanced); })
    .attr("cy", function (d) { return y(d.Country); })
    .attr("r", "4")
    .style("fill", "#010101")
  .on("mouseenter", showTooltip)
    .on("mouseleave", hideTooltip);

  // Circles of the high variable
  svg.selectAll("mycircle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.high); })
    .attr("cy", function (d) { return y(d.Country); })
    .attr("r", "4")
    .style("fill", "#fff")
    .attr("stroke", "#010101")
    .attr("stroke-width", "2px")
  .on("mouseenter", showTooltip)
    .on("mouseleave", hideTooltip);

  // Circles of the intermediate variable
  svg.selectAll("mycircle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.intermediate); })
    .attr("cy", function (d) { return y(d.Country); })
    .attr("r", "4")
    .style("fill", "#87322E")
  .on("mouseenter", showTooltip)
    .on("mouseleave", hideTooltip);

  // Circles of the low variable
  svg.selectAll("mycircle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d.low); })
    .attr("cy", function (d) { return y(d.Country); })
    .attr("r", "4")
    .style("fill", "#C28838")
    .attr("stroke", "#981924")
    .attr("stroke-width", "2px")
  .on("mouseenter", showTooltip)
    .on("mouseleave", hideTooltip);

  if (benchmarkIndex !== -1) {
    var benchmarkLineY = getLastBenchmarkYPosition(sortedData, y);

    // Append light gray rectangle
    svg.append("rect")
      .attr("x", 1)
      .attr("y", benchmarkLineY - 27)
      .attr("width", width)
      .attr("height", 23 - 5) // the difference between y values of your lines
      .style("fill", "lightgray");  // use any light gray 

    // Append bottom benchmark line
    svg.append("line")
      .attr("x1", 0)
      .attr("y1", benchmarkLineY - 10)
      .attr("x2", width)
      .attr("y2", benchmarkLineY - 10)
      .style("stroke", "black") // change the color as per your requirement
      .style("stroke-width", 1.8);
    // Append top benchmark line
    svg.append("line")
      .attr("x1", 0)
      .attr("y1", benchmarkLineY - 27)
      .attr("x2", width)
      .attr("y2", benchmarkLineY - 27)
      .style("stroke", "black") // change the color as per your requirement
      .style("stroke-width", 1.8);

    // Benchmark label - Place it where "Benchmarking Participants" is on the y scale
    svg.append("text")
      .attr("x", 5)
      .attr("y", benchmarkLineY - 14)  // Adjust this value to your needs
      .text("Benchmarking Participants")
      .style("font-size", "13px")
      .style("font-weight", "bold")
      .style("fill", "black")
      .style('font-family', 'PT Sans');
  }

  //change the height of dataChart to match the height of the svg
  let dataChart = d3.select("#my_dataviz")
  var holderSVG = d3.select("#my_dataviz").select("svg");
  dataChart.attr("height", height)
  dataChart.style("overflow", "scroll-x")
  holderSVG.attr("height", height + 10);
  holderSVG.attr("width", width);

  dataChart.on("mouseleave", function () {
    //remove 'active' from all line elements
    let tooltip = d3.select("#tooltip");
    tooltip.style("display", "none");
  })
  createCountryDivs(data)
}

/*
------------------------
METHOD: Set up event listeners on both divs to update the scroll position of the other when it's scrolled
------------------------
*/
var myDataviz = document.getElementById("my_dataviz");
var datavizCopy = document.getElementById("datavizCopy");

myDataviz.addEventListener("scroll", function () {
  datavizCopy.scrollTop = myDataviz.scrollTop;
});

datavizCopy.addEventListener("scroll", function () {
  myDataviz.scrollTop = datavizCopy.scrollTop;
});

/*
------------------------
METHOD: create a click event listener for datavizCopy that toggles the display of the div
------------------------
*/
sidePanelButtonHandler('sidePanelButton', 'datavizCopy')

/*
------------------------
METHOD: create a click event listener for datavizCopy that prints out the graph
------------------------
*/
document.getElementById('downloadButton1').addEventListener('click', function () {
  const svgElement = document.querySelector('#my_dataviz svg');
  svgToJpegDownload(svgElement, 'PIRLS2021_Exhibit 4.2.png');
});

/*
------------------------
METHOD: read in the data and create the axes
------------------------
*/
d3.csv("https://html-css-js.jadesign.repl.co/data/percentages.csv", function (data) {
  var globalDataSet = [];
  globalDataSet = data
  // Add X axis
  var x = d3.scaleLinear()
    .domain([0, 100])
    .range([0, width]);

  /*
  ------------------------
  METHOD: create the dropdowns that determine if we will sort asc or desc
  ------------------------
  */
  d3.selectAll(".dropdownMenu").on("change", function () {
    let newData = sortDropdownHandler(orderDropdown, globalDataSet)
    globalDataSet = newData
    createChart(svg, newData);
    createCountryDivs(newData);
    handleCheckboxChange();
  })


  /*
  ------------------------
  METHOD: Set up event listener for the check box to toggle the visibility of the different waves
  ------------------------
  */
  var checkbox1 = document.getElementById('option1');
  var checkbox2 = document.getElementById('option2');

  function filterDataSet(dataSet, checkbox1, checkbox2) {
    // Assuming Wave field in your dataset indicates the wave number as 'wave1' or 'wave2'
    let wave1 = checkbox1.checked ? '1' : null;
    let wave2 = checkbox2.checked ? '2' : null;
    return dataSet.filter(d => d.Wave === wave1 || d.Wave === wave2);
  }

  checkbox1.addEventListener('change', function () {
    handleCheckboxChange();
  });

  checkbox2.addEventListener('change', function () {
    handleCheckboxChange();
  });

  function handleCheckboxChange() {
    let filteredData = filterDataSet(globalDataSet, checkbox1, checkbox2);
    createChart(svg, filteredData);
    createCountryDivs(filteredData);
  }

  /*
  ------------------------
  METHOD: populate the search input with the list of countries and called createSearchResults whenever an input event is fired
  ------------------------
  */
  //push the lowercase version of the country into the array
  let countries = []
  data.forEach(country => {
    countries.push(country.Country.toLowerCase())
  })

  // Get references to the search input and the results dropdown
  const searchInput = document.querySelector('#searchBarSelector');
  const resultsDropdown = document.querySelector('#resultsSelector');
  let currentClickedButtons = [];

  // Add an event listener to the search input that filters the results whenever the input value changes
  searchInput.addEventListener('input', event => {
    const inputValue = event.target.value;
    createSearchResults(data, inputValue, countries, resultsDropdown);

    /*
    ------------------------
    SEARCH RESULTS BUTTONS: Select all buttons in the searchResults area. attach a click event listener to each button so, when clicked, it adds the country to the currentlySelectedCountries section, then redraws the chart
    ------------------------
    */
    const searchResultsButtons = d3.selectAll('.resultButton');
    searchResultsButtons.on('click', function () {
      let currentlySelectedCountriesDataset = []
      let button = d3.select(this);

      currentClickedButtons.push(button._groups[0][0].textContent);
      button.classed("resultButtonSelected", true);

      // For each country in currentClickedButtons, go through the data array and find the entry where its Country property matches country
      currentClickedButtons.forEach(function (country) {
        let index = data.findIndex(d => d.Country === country);
        currentlySelectedCountriesDataset.push(data[index])
      })


      //call the function to filter the buttons that have been clicked, then call the createChart function
      showClicked(currentClickedButtons, data);

      //attach the click event to the clear selections button that will erase all the buttons. it's made during the showClicked function
      d3.select("#clearSelections")
        .on("click", function () {
          //remove the buttons from the div
          d3.select("#searchBarResults").selectAll("*").remove();
          createChart(svg, data);
          globalDataSet = data;
          currentlySelectedCountriesDataset = data;
          currentClickedButtons = [];
          d3.selectAll('.resultButton').classed('resultButtonSelected', false);
          d3.select('.dropdownMenu').dispatch('change');
          handleCheckboxChange();
        })

      createChart(svg, currentlySelectedCountriesDataset);
      globalDataSet = currentlySelectedCountriesDataset;
      d3.select('.dropdownMenu').dispatch('change');
      handleCheckboxChange();


      /*
       ------------------------
       SELECTED COUNTRIES BUTTONS: Select all buttons in the selectedCountries area. attach a click event listener to each button so, when clicked, it removes the country from the currentlySelectedCountries section, then redraws the chart
       ------------------------
       */
      const selectedResultsButtons = d3.selectAll('.selectedCountry');
      selectedResultsButtons.on('click', function () {

        //get the name of the current button clicked
        let currentCountryButton = d3.select(this);
        let currentCountryButtonName = currentCountryButton._groups[0][0].textContent;

        // Remove the currently selected country from the currentClickedButtons list
        let index = currentClickedButtons.indexOf(currentCountryButtonName);
        if (index > -1) {
          currentClickedButtons.splice(index, 1);
        }

        //Remove the country that was clicked from the currentlySelectedCountriesDataset 
        let currentlySelectedCountriesDataset = [];
        currentClickedButtons.forEach(function (country) {
          let index = data.findIndex(d => d.Country === country);
          currentlySelectedCountriesDataset.push(data[index]);
        })

        //Remove the currently selected country from the currentlySelectedCountries section
        const selectedElements = document.querySelectorAll('.selectedCountry');
        selectedElements.forEach(element => {
          if (element.id.includes(currentCountryButtonName)) {
            element.remove();
          }
        });

        //remove '.resultButtonSelected' class from the button in the results div'
        let searchBarResults = document.querySelectorAll('.resultButton');
        for (let i = 0; i < searchBarResults.length; i++) {
          if (searchBarResults[i].id == currentCountryButtonName) {
            searchBarResults[i].classList.remove('resultButtonSelected');
          }
        }

        //if currentlySelectedCountries is empty, redraw createChart with the data from the data array
        if (currentlySelectedCountriesDataset.length != 0) {
          createChart(svg, currentlySelectedCountriesDataset);
          globalDataSet = currentlySelectedCountriesDataset;
          d3.select('.dropdownMenu').dispatch('change');
          handleCheckboxChange();
        } else {
          createChart(svg, data);
          globalDataSet = data;
          //remove the #clearSelections button
          d3.select("#clearSelections").remove()
          d3.select('.dropdownMenu').dispatch('change');
          handleCheckboxChange();
        }
      })
    })
  })


  /*
------------------------
CLICK EVENT TO CLOSE SEARCH RESULTS: Listen for clicks on the entire document
------------------------
*/
  let ignoreNextDocumentClick = false;

  // Existing code for the 'focus' event on searchInput
  searchInput.addEventListener('focus', function () {
    resultsDropdown.style.display = 'block'; // Adjust as per your CSS
    ignoreNextDocumentClick = true;  // Set the flag
  });

  // Existing code for the 'click' event on document
  document.addEventListener('click', function (event) {
    if (ignoreNextDocumentClick) { // If the flag is set, do not hide the dropdown
      ignoreNextDocumentClick = false; // Reset the flag
      return;
    }

    const isClickInsideSearchBar = searchInput.contains(event.target);
    const isClickInsideResults = resultsDropdown.contains(event.target);
    const isResultButton = event.target.classList.contains('selectedCountry');

    // If clicked outside search bar, resultsDropdown, or a resultButton, hide the dropdown
    if (!isClickInsideSearchBar && !isClickInsideResults && !isResultButton) {
      resultsDropdown.style.display = 'none';
    }
  });

  /*
  ------------------------
  METHOD: make width the half the size of the viewport width, until it gets down to mobile, where it should be 100% of the width
  ------------------------
  */
  function reportWindowSize() {
    if (window.innerWidth > 968) {
      width = 640;
      height = 900;
    }
    else if (window.innerWidth > 728) {
      width = 520;
      height = 900;
    }
    else {
      width = window.innerWidth - 60;
      height = 900;
    }
    //set the new width and height of the svg, set the new width and height of the x-axis
    svg.attr("width", width)
    svg.attr("height", height);
    xAxisDiv.attr("width", width)
    xAxisDiv.attr("height", 50);
    createChart(svg, globalDataSet);
    createCountryDivs(globalDataSet);
    handleCheckboxChange();
  }

  window.onresize = reportWindowSize;
  //fire resize event on load
  reportWindowSize();
});