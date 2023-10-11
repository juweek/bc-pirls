import { createCountryDivs, sidePanelButtonHandler } from './helperFunctions/sidePanel.js';
import { showClicked, createSearchResults } from './helperFunctions/searchFilter.js';
import { sortList, sortDropdownHandler } from './helperFunctions/sort.js';

/*
------------------------
METHOD: set the dimensions of the graph
------------------------
*/
var margin = { top: 10, right: 20, bottom: 0, left: 10 },
  width = 200 - margin.left - margin.right,
  height = 180 - margin.top - margin.bottom;


//create an array of all the countries
let countries = []

/*
------------------------
METHOD: //select all the dropdowns 
------------------------
*/
var sortDropdown = d3.select("#sortDropdown");
var orderDropdown = d3.select("#orderDropdown");
let clickedButtons = [];

var tooltip = d3.select("#svganchor")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px");


// Create a function to draw the separation line
function drawBenchmarkLine() {
  // Remove the existing benchmark line
  d3.select("#benchmark-line").remove();

  // Get the chart elements array
  var charts = Array.from(document.querySelectorAll(".chart"));

  // Find the first chart with a benchmark of 0 or 1
  var firstBenchmark2Chart = charts.find(chart => parseInt(chart.getAttribute("data-benchmark")) == 1);

  if (firstBenchmark2Chart) {
    // Insert the benchmark line before the first chart with a benchmark of 1
    var line = document.createElement("hr");
    line.id = "benchmark-line";
    firstBenchmark2Chart.parentNode.insertBefore(line, firstBenchmark2Chart);

    // Create a new div to group the charts with a benchmark of 1
    var benchmark1Div = document.createElement("div");

    // Move the charts with a benchmark of 1 to the new div
    var nextSibling = firstBenchmark2Chart.nextSibling;
    while (nextSibling && (parseInt(nextSibling.getAttribute("data-benchmark")) === 1)) {
      benchmark1Div.appendChild(nextSibling);
      nextSibling = firstBenchmark2Chart.nextSibling;
    }

    // Get the parent node of the parent of the first chart with a benchmark of 1
    var grandparent = firstBenchmark2Chart.parentNode.parentNode;

    // Insert the new div after the parent of the first chart with a benchmark of 1
    var nextElement = firstBenchmark2Chart.parentNode.nextElementSibling;
    grandparent.insertBefore(benchmark1Div, nextElement);
  }
}

/*
------------------------
METHOD: create the line graphs using the filters and search bars
------------------------
  */
function createChart(svg, data) {
  //set width and height to the svg parameters
  let width = svg.attr("width") - margin.right;
  let height = svg.attr("height") - margin.top - margin.bottom;

  var dataReady = [{
    name: 'Average',
    values: data.map(d => ({ time: d.time, value: d.Average }))
  }
  ];

  var dataReady2 = [{
  name: 'Average',
  values: data.filter(d => String(d.time).endsWith('g')).map(d => ({ time: d.time, value: d.Average }))
}];

  var currentSVG = svg;

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([250, 800])
    .range([height, 0]);

  var yAxis = currentSVG.append("g")
    //translate the y axis to the left side of the graph
    .attr("transform", "translate(-2, 0)")
    .attr("class", "y-axis1")
    .call(d3.axisLeft(y)
      .tickValues([300, 400, 500, 600, 700])
    );

  // Modify the y-axis labels to move them to the right of the axis line
  yAxis.selectAll("text")
    .style("text-anchor", "start")
    .style("font-family", "PT Sans")
    .attr("dx", "2em"); // This moves the labels to the right by "1em". Adjust as necessary.

  // Flip the tick marks to the right side of the axis line
  yAxis.selectAll(".tick line")
    .attr("x1", "0px") // This moves the tick lines to start at the same point as the labels.
    .attr("x2", "1em") // This makes the tick lines have zero length, effectively hiding them. 
  // If you want to show the tick marks, you can use a different value.

  var svgWidth = currentSVG.node().getBoundingClientRect().width; // Get the full SVG width

  // Add X axis --> it is a date format
  var x = d3.scaleLinear()
    .domain([1999, 2026])
    .range([0, width]);

  // Append rectangle for the background and border
  currentSVG.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", svgWidth)
    .attr("height", 20) // Adjust as needed
    .attr("fill", "lightgray")
    .attr("stroke-width", 1)
    .attr("stroke", "black")
    .attr("stroke-dasharray", "0, 0, 1, 0"); // This will create a bottom border

  // Axis for the labels
  var xAxis = currentSVG.append("g")
    .attr("transform", "translate(35, -1)")  // Position the labels at the middle of the grey bar
    .attr("class", "x-axis1")
    .call(
      d3.axisBottom(x)
        .tickFormat(function (d) { return d.toString().replace(/,/g, ''); }) // remove commas from tick labels
        .tickValues([2001, 2006, 2011, 2016, 2021])
    );

  // Remove the axis line
  xAxis.selectAll("path").remove();

  // Modify the x-axis labels
  xAxis.selectAll("text")
    .style("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("font-family", "PT Sans");

  // Custom ticks - adjust their position independently
  xAxis.selectAll("line")
    .attr("stroke", "black")
    .attr("y2", 3) // This will position the tick marks a little bit lower
    .attr("transform", "translate(0,21)"); // Adjust as needed to move the ticks lower

  // Preprocess your data to remove invalid points
  let newDataReady = dataReady.map(function (series) {
    return {
      ...series,
      values: series.values.filter(function (d) {
        return !isNaN(d.value) && d.value !== null && d.value !== '0' && d.value !== 0;
      })
    };
  });

  let newDataReady2 = dataReady2.map(function (series) {
  return {
    ...series,
    values: series.values.filter(function (d) {
      return !isNaN(d.value) && d.value !== null && d.value !== '0' && d.value !== 0;
    })
  };
});

  // This assumes that dataReady is an array with a single object that has a `values` property
  var sortedData = newDataReady[0].values
    // Filter out entries where time is not a number and not one of 'Wave', 'Country', or 'Benchmark'
    .filter(d => !isNaN(d.time) || ['Wave', 'Country', 'Benchmark'].includes(d.time))
    // Sort the entries by time
    .sort((a, b) => a.time - b.time);

  let sortedData2 = newDataReady2[0].values
  .filter(d => !isNaN(d.time.slice(0, -1)) || ['Wave', 'Country', 'Benchmark'].includes(d.time))
  .sort((a, b) => a.time - b.time);

  let wave = newDataReady[0].values.find(v => v.time === 'Wave').value;

  for (let i = 0; i < sortedData.length - 1; i++) {
    if (['Wave', 'Country', 'Benchmark'].includes(sortedData[i].time)) continue; // Skip these entries

    let segmentData = [sortedData[i], sortedData[i + 1]];

    let segment = d3.line()
      .defined(function (d) { return !isNaN(d.value) && d.value != null && d.value !== '0'; })
      .x(function (d) { return x(+d.time); })
      .y(function (d) { return y(+d.value); });

    currentSVG.append("path")
      .attr("d", segment(segmentData))
      .attr("stroke", +segmentData[1].time === 2021 ? (wave === '2' ? '#E9CBCC' : '#9D0505') : '#9D0505')
      .style("stroke-width", 2)
      .style("stroke-dasharray", +segmentData[1].time === 2021 ? "2,2" : "none")
      .style("fill", "none")
      .attr("transform", "translate(35, 0)");
  }

  for (let i = 0; i < sortedData2.length - 1; i++) {
  if (['Wave', 'Country', 'Benchmark'].includes(sortedData2[i].time)) continue;

  let segmentData2 = [sortedData2[i], sortedData2[i + 1]];
  let segment2 = d3.line()
    .defined(function (d) { return !isNaN(d.value) && d.value != null && d.value !== '0'; })
    .x(function (d) { 
      let time = d.time;
      // Check if 'g' is appended and strip it off
      if(typeof time === 'string' && time.endsWith('g')) {
        time = time.slice(0, -1);
      }
      return x(+time); 
    })
    .y(function (d) { return y(+d.value); });

    

currentSVG.append("path")
    .attr("d", segment2(segmentData2)) // Use segment2 instead of segment
    .attr("stroke", +segmentData2[1].time == '2021' ? (wave == '2' ? '#293F79' : '#183581') : '#183581')
    .style("stroke-width", 2)
    .style("stroke-dasharray", +segmentData2[1].time == '2021' ? "2,2" : "none")
    .style("fill", "none")
    .attr("transform", "translate(35, 0)");
}

  var benchmarkLine = document.querySelector("#benchmark-line");

  // Add the points
  currentSVG
    // First we need to enter in a group
    .selectAll("myDots")
    .data(dataReady)
    .enter()
    .append('g')
    .style("fill", function (d) { return '#9D0505' })
    // Second we need to enter in the 'values' part of this group
    .selectAll("myPoints")
    .data(function (d) {
      if (d) {
        return d.values
      }
      else {
        return null
      }
    })
    .enter()
    .each(function (d) {
      // Add the error bars
      var errorBarLength = 15;  // Define the length of the error bars;  // Define the length of the error bars
      var yPos = y(d.value);
      d3.select(this)
        .append("line")
        .attr("class", "errorBar")
        .attr("x1", function(d) { 
          let time = d.time;
          if(typeof time === 'string' && time.endsWith('g')) {
            time = time.slice(0, -1);
          }
          return x(+time); 
        })  // centered on the rectangle
        .attr("y1", yPos - errorBarLength / 2)
        .attr("x2", function(d) { 
          let time = d.time;
          if(typeof time === 'string' && time.endsWith('g')) {
            time = time.slice(0, -1);
          }
          return x(+time); 
        })  // centered on the rectangle
        .attr("y2", yPos + errorBarLength / 2)
        .attr("stroke", "black")
        .attr("transform", "translate(35, 0)")
        .attr("stroke-width", 1);

      // Add the rectangle
      d3.select(this)
        .append("rect")
        .attr("class", "myDots")
         .attr("x", function(d) { 
          let time = d.time;
          if(typeof time === 'string' && time.endsWith('g')) {
            time = time.slice(0, -1);
          }
          return x(+time) - 3; 
          })    
        .attr("y", y(d.value) - 3)
        .attr("width", 6)
        .attr("height", 6)
        .attr("stroke", "white")
        .attr("transform", "translate(35, 0)")
        .attr("data-value", d.value)
        .attr("data-time", d.time)
        .style("opacity", d.value == 0 || isNaN(d.value) ? 0 : 1)
    });
 //for each circle point, display a text element 
currentSVG
  // First we need to enter in a group
  .selectAll("myText")
  .data(dataReady)
  .enter()
  .append('g')
  // Second we need to enter in the 'values' part of this group
  .selectAll("myPoints")
  .data(function (d) {
    if (d) {
      return d.values
    }
    else {
      return 0
    }
  })
  .enter()
  .append("g")  // Create a new group for each text and its background
  .each(function (d) {
    // Append rectangle as a background first
    let validTimes = ['2001', '2006', '2011', '2016', '2021'];
    let time = d.time;
    if(typeof time === 'string' && time.endsWith('g')) {
      time = time.slice(0, -1);
    }
    // Only process this data point if its 'time' value is a valid time
    if (!validTimes.includes(time)) {
      return;
    }
    // Append rectangle as a background first
    d3.select(this).append("rect")
      .attr("x", function() { 
        let time = d.time;
        if(typeof time === 'string' && time.endsWith('g')) {
          time = time.slice(0, -1);
        }
        return x(+time) + 25; 
      })
      .attr("y", function() { 
        let time = d.time;
        if(typeof time === 'string' && time.endsWith('g')) {
          return y(d.value) + 16;  // Adjust the n
        } else {
          return y(d.value) - 28;  // Adjust the n
        }
      })
      .attr("width", 20)  // Width of the rectangle (you can adjust this)
      .attr("height", 10.5)  // Height of the rectangle (same as the font size)
      .attr("opacity", .1)  // Height of the rectangle (same as the font size)
      .style("fill", function() { 
        let time = d.time;
        // If time ends with 'g', fill color is red, else it's blue
        return (typeof time === 'string' && time.endsWith('g')) ? "red" : "blue";
      });

    // Append text element after the rectangle
    d3.select(this).append("text")
      .attr("x", function() { 
        let time = d.time;
        if(typeof time === 'string' && time.endsWith('g')) {
          time = time.slice(0, -1);
        }
        return x(+time) + 3; 
      })
      .attr("y", function() { 
        let time = d.time;
        if(typeof time === 'string' && time.endsWith('g')) {
          return y(d.value) - 6;  // Adjust the n
        } else {
          return y(d.value) + 30;  // Adjust the n
        }
      })
      .text(function () { return d.value })
      .attr("text-anchor", "middle")
      .attr("font-size", "10.5px")
      .attr("font-family", "PT Sans")
      .attr("fill", "black")
      .attr("class", "textLine")
      .attr("data-value", function () { return d.value })
      .attr("data-time", function () { return d.time })
      .attr("data-name", function () { return d.name })
      .attr("transform", "translate(30, -10)");
  });


  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function (d) {
    tooltip.style("opacity", 1)
    d3.select(this).style("fill", "red")
  }

  // Update the tooltip in the mousemove function
  var mousemove = function (d) {
    let currentScore = d3.select(this).attr("data-value")
    let roundedScore = Math.round(currentScore * 100) / 100
    //get current year
    let currentYear = d3.select(this).attr("data-time")
    tooltip
      .html("PIRLS " + currentYear + " average achievement: <b>" + currentScore + "</b>")
      .style("left", (window.event.clientX + 10) + "px")  // Use window.event instead of d3.event
      .style("top", (window.event.clientY) + 250 + "px")
  }

  var mouseleave = function (d) {
    tooltip
      .style("opacity", 0)
    d3.select(this).style("fill", null)
  }

  //attach the event listeners to the myDots rectangles
  currentSVG.selectAll(".myDots") // Change to ".myDots" to select by class name
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)

  // Add X axis --> it is a date format
  var x = d3.scaleTime()
}


async function getCountriesData() {
  var transformedData = {};

  d3.csv("https://html-css-js.jadesign.repl.co/data/gender.csv", function (error, data) {
    var globalDataSet
    globalDataSet
    if (error) throw error;

    // remove the first header "Country"
    var headers = Object.keys(data[0]);

    // transform the data
    data.forEach(function (row) {
      var country = row["Country"];
      var wave = row['Wave']
      var benchmark = row['Benchmark']
      transformedData[country] = [];
      headers.forEach(function (header, index) {
        transformedData[country].push({ time: header, Average: row[header], Benchmark: benchmark });
      });
    });

    globalDataSet = transformedData

    //push the lowercase version of the country into the array
    data.forEach(country => {
      countries.push(country.Country.toLowerCase())
    })


    /*
    ------------------------
    METHOD: call the function that creates the charts for the first time
    ------------------------
    */
    var container = d3.select("#svganchor");
    // Create a div to hold the charts with benchmark = 0
    var benchmark0Div = container.append("div");
    benchmark0Div.attr("id", "benchmark0")
    benchmark0Div.attr("class", "benchmarkGroup")
    // Create a div to hold the charts with benchmark = 1
    var benchmark1Div = container.append("div");
    benchmark1Div.attr("id", "benchmark1")
    benchmark1Div.attr("class", "benchmarkGroup")
    // For each country, create a chart and display it
    // Create a div for the "benchmarking participants" text

    for (var country in transformedData) {
      var data = transformedData[country];
      var chart = container.append("div")
        .attr("class", "chart")
        .attr("id", country + "-chart")
        // For each chart, create data attributes corresponding to each year and benchmark
        .attr("data-currentWave", function () {
          return data[6].Average != null && data[6].Average != undefined ? data[6].Average : 0;
        })
        .attr("data-2001", function () {
          return data[0].Average != null && data[1].Average != undefined ? data[1].Average : 0;
        })
        .attr("data-2006", function () {
          return data[1].Average != null && data[1].Average != undefined ? data[1].Average : 0;
        })
        .attr("data-2011", function () {
          return data[2].Average != null && data[2].Average != undefined ? data[2].Average : 0;
        })
        .attr("data-2016", function () {
          return data[3].Average != null && data[3].Average != undefined ? data[3].Average : 0;
        })
        .attr("data-2021", function () {
          return data[4].Average != null && data[4].Average != undefined ? data[4].Average : 0;
        })
        .attr("data-benchmark", function () {
          return data[7].Average != null && data[6].Average != undefined ? data[7].Average : 0;
        })
        .attr("data-country", function () {
          return data[5].Average != null && data[5].Average != undefined ? data[5].Average : 0;
        });

      var chartSVG = chart.append("svg")
        // Set width to just half the width of the window
        .attr("width", 190)
        .attr("height", 180);

      // Give each chart a title before the chart
      chart.append("div")
        .attr("class", "chartTitleBackground")
        .append("h3")
        .attr("class", "chartTitle")
        .text(data[5].Average);

      createChart(chartSVG, data);

      // Append the chart to the corresponding benchmark div based on the data-benchmark attribute
        var benchmarkValue = parseInt(chart.attr("data-benchmark"));
        if (benchmarkValue == 0) {
          benchmark0Div.node().appendChild(chart.node());
        } else if (benchmarkValue === 1) {
            // Add the "benchmarking participants" text if it doesn't exist already
            var benchmarkingText = benchmark1Div.node().querySelector('div');
            if (!benchmarkingText) {
              benchmark1Div.node().insertAdjacentHTML('beforebegin', '<div class="benchmarkTitle">Benchmarking Participants</div>');
            }
            benchmark1Div.node().appendChild(chart.node());
          }
    }


    
/*
------------------------
METHOD: create the dropdowns that determine how we will display the year. first, distinguish what type of sort it is
------------------------
*/
    d3.selectAll(".dropdownMenu").on("change", function () {
      // Get the selected sort metric and sort order from the dropdowns
      var sortMetric = d3.select("#sortDropdown").node().value; // e.g. "2006"
      var sortOrder = d3.select("#orderDropdown").node().value; // e.g. "asc"

      // Get all the chart elements and convert them to an array
      var charts = Array.from(document.querySelectorAll(".chart"));

      // Sort the chart elements based on the selected year and sort order
      charts.sort(function (a, b) {
        var aVal, bVal;
        if (sortMetric == "country") {
          aVal = a.getAttribute("data-country");
          bVal = b.getAttribute("data-country");
          if (aVal === null) aVal = "";
          if (bVal === null) bVal = "";
          if (sortOrder == "asc") {
            return aVal.localeCompare(bVal);
          } else if (sortOrder == "desc") {
            return bVal.localeCompare(aVal);
          }
        } else {
          aVal = parseInt(a.getAttribute("data-" + sortMetric));
          bVal = parseInt(b.getAttribute("data-" + sortMetric));

          // Check if values are 0 or null and add a class
          if (isNaN(aVal) || aVal === 0) {
            a.classList.add('low-opacity');
            aVal = 0;
          } else {
            a.classList.remove('low-opacity');
          }

          if (isNaN(bVal) || bVal === 0) {
            b.classList.add('low-opacity');
            bVal = 0;
          } else {
            b.classList.remove('low-opacity');
          }

          // Continue with your existing sort logic
          if (sortOrder == "asc") {
            if (aVal < bVal) return -1;
            if (aVal > bVal) return 1;
            if (aVal === bVal) return a.textContent.localeCompare(b.textContent);
          } else if (sortOrder == "desc") {
            if (aVal < bVal) return 1;
            if (aVal > bVal) return -1;
            if (aVal === bVal) return a.textContent.localeCompare(b.textContent);
          }
        }
      });
      // Reorder the chart elements in the DOM based on the sorted array
      var chartContainer = d3.select("#svganchor");
      charts.forEach(function (chart) {
        chartContainer.node().appendChild(chart);
      });
      
 //iterate through all the graphs and append the chart to the corresponding benchmark div based o the data-benchmark attribute
  var benchmark0Div = document.querySelector("#benchmark0");
  var benchmark1Div = document.querySelector("#benchmark1");

  // First remove all child nodes from both benchmark divs
    while (benchmark0Div.firstChild) {
      if (benchmark0Div.firstChild.classList.contains('chart')) {
        benchmark0Div.removeChild(benchmark0Div.firstChild);
      } else {
        break;
      }
    }
    
    while (benchmark1Div.firstChild) {
      if (benchmark1Div.firstChild.classList.contains('chart')) {
        benchmark1Div.removeChild(benchmark1Div.firstChild);
      } else {
        break;
      }
    }

  // Remove any existing 'Benchmarking Participants' titles
  var benchmarkingTexts = document.querySelectorAll('div.benchmarkTitle');
  benchmarkingTexts.forEach(function (text) {
    text.remove();
  });

  charts.forEach(function (chart) {
    var benchmarkValue = parseInt(chart.getAttribute("data-benchmark"));
    if (benchmarkValue == 0) {
      benchmark0Div.appendChild(chart);
    } else if (benchmarkValue == 1) {
      benchmark1Div.appendChild(chart);
    }
  });
  // Now that all charts have been appended, check for the title
  var benchmarkingText = benchmark1Div.querySelector('div.benchmarkTitle');
  if (!benchmarkingText && benchmark1Div.hasChildNodes()) {
    benchmark1Div.insertAdjacentHTML('beforebegin', '<div class="benchmarkTitle">Benchmarking Participants</div>');
  }
});


          /*
      ------------------------
      SEARCH RESULTS BUTTONS: Select all buttons in the searchResults area. attach a click event listener to each button so, when clicked, it adds the country to the currentlySelectedCountries section, then redraws the chart
      ------------------------
      */
    // Get references to the search input and the results dropdown
    const searchInput = document.querySelector('#searchBarSelector');
    const resultsDropdown = document.querySelector('#resultsSelector');
    let currentClickedButtons = [];

    // Add an event listener to the search input that filters the results whenever the input value changes
    searchInput.addEventListener('input', event => {
      const inputValue = event.target.value;
      createSearchResults(data, inputValue, countries, resultsDropdown);


      const searchResultsButtons = d3.selectAll('.resultButton');
      searchResultsButtons.on('click', function () {
        let currentlySelectedCountriesDataset = []
        let button = d3.select(this);

        currentClickedButtons.push(button._groups[0][0].innerHTML);
        button.classed("resultButtonSelected", true);

        // For each country in currentClickedButtons, go through the data array and find the entry where its Country property matches country
        currentClickedButtons.forEach(function (country) {
          //let index = data.findIndex(d => d.Country === country);
          let index = transformedData[country]
          currentlySelectedCountriesDataset.push(index)
        })

        //call the function to filter the buttons that have been clicked, then call the createChart function
        showClicked(currentClickedButtons, data);

        //clear out the current svg
        let svgContainer = d3.select('#svganchor');
        svgContainer.selectAll('*').remove();

        for (var country in currentlySelectedCountriesDataset) {
          var data = currentlySelectedCountriesDataset[country];
          var chart = d3.select("#svganchor").append("div")
            .attr("class", "chart")
            .attr("id", country + "-chart")
            .attr("data-2001", function () {
              return data[0].Average != null && data[1].Average != undefined ? data[1].Average : 0;
            })
            .attr("data-2006", function () {
              return data[1].Average != null && data[1].Average != undefined ? data[1].Average : 0;
            })
            .attr("data-2011", function () {
              return data[2].Average != null && data[2].Average != undefined ? data[2].Average : 0;
            })
            .attr("data-2016", function () {
              return data[3].Average != null && data[3].Average != undefined ? data[3].Average : 0;
            })
            .attr("data-2021", function () {
              return data[4].Average != null && data[4].Average != undefined ? data[4].Average : 0;
            })
            .attr("data-benchmark", function () {
              return data[7].Average != null && data[6].Average != undefined ? data[7].Average : 0;
            })
            .attr("data-country", function () {
              return data[5].Average != null && data[5].Average != undefined ? data[5].Average : 0;
            });
          var chartSVG = chart.append("svg")
            // Set width to just half the width of the window
            .attr("width", 190)
            .attr("height", 180);

          // Give each chart a title before the chart
          chart.append("div")
            .attr("class", "chartTitleBackground")
            .append("h3")
            .attr("class", "chartTitle")
            .text(data[5].Average);
          createChart(chartSVG, data);
        }
        drawBenchmarkLine();
        console.log(benchmarkCharts)
        globalDataSet = currentlySelectedCountriesDataset;
        /*
         ------------------------
         SELECTED COUNTRIES BUTTONS: Select all buttons in the selectedCountries area. attach a click event listener to each button so, when clicked, it removes the country from the currentlySelectedCountries section, then redraws the chart
         ------------------------
         */
        const selectedResultsButtons = d3.selectAll('.selectedCountry');
        selectedResultsButtons.on('click', function () {

          //clear out the current svg
          let svgContainer = d3.select('#svganchor');
          svgContainer.selectAll('*').remove();

          //get the name of the current button clicked
          let currentCountryButton = d3.select(this);
          let currentCountryButtonName = currentCountryButton._groups[0][0].innerHTML;

          // Remove the currently selected country from the currentClickedButtons list
          let index = currentClickedButtons.indexOf(currentCountryButtonName);
          if (index > -1) {
            currentClickedButtons.splice(index, 1);
          }

          //Remove the country that was clicked from the currentlySelectedCountriesDataset 
          let currentlySelectedCountriesDataset = [];
          currentClickedButtons.forEach(function (country) {
            let index = transformedData[country]
            currentlySelectedCountriesDataset.push(index)
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
            //createChart(svg, currentlySelectedCountriesDataset);
            for (var country in currentlySelectedCountriesDataset) {
              var data = currentlySelectedCountriesDataset[country];
              var chart = d3.select('#svganchor').append('div')
                .attr('class', 'chart')
                .attr('id', country + '-chart')
                .attr('data-2001', function () { return data[0].Average != null && data[1].Average != undefined ? data[1].Average : 0; })
                .attr('data-2006', function () { return data[1].Average != null && data[1].Average != undefined ? data[1].Average : 0; })
                .attr('data-2011', function () { return data[2].Average != null && data[2].Average != undefined ? data[2].Average : 0; })
                .attr('data-2016', function () { return data[3].Average != null && data[3].Average != undefined ? data[3].Average : 0; })
                .attr('data-2021', function () { return data[4].Average != null && data[4].Average != undefined ? data[4].Average : 0; })
                .attr('data-benchmark', function () { return data[7].Average != null && data[6].Average != undefined ? data[7].Average : 0; })
                .attr('data-country', function () { return data[5].Average != null && data[5].Average != undefined ? data[5].Average : 0; });
              var chartSVG = chart.append('svg')
                //set width to just half the width of the window
                .attr('width', 190)
                .attr('height', 180);

              // Give each chart a title before the chart
              chart.append('div')
                .attr('class', 'chartTitleBackground')
                .append('h3')
                .attr('class', 'chartTitle')
                .text(data[5].Average);

              //call the function to create the chart
              createChart(chartSVG, data);
            }
            drawBenchmarkLine();
            console.log(benchmarkCharts)
            globalDataSet = currentlySelectedCountriesDataset;
          } else {
            for (var country in transformedData) {
              var data = transformedData[country];
              var chart = d3.select('#svganchor').append('div')
                .attr('class', 'chart')
                .attr('id', country + '-chart')
                .attr('data-2001', function () { return data[0].Average != null && data[1].Average != undefined ? data[1].Average : 0; })
                .attr('data-2006', function () { return data[1].Average != null && data[1].Average != undefined ? data[1].Average : 0; })
                .attr('data-2011', function () { return data[2].Average != null && data[2].Average != undefined ? data[2].Average : 0; })
                .attr('data-2016', function () { return data[3].Average != null && data[3].Average != undefined ? data[3].Average : 0; })
                .attr('data-2021', function () { return data[4].Average != null && data[4].Average != undefined ? data[4].Average : 0; })
                .attr('data-benchmark', function () { return data[7].Average != null && data[6].Average != undefined ? data[7].Average : 0; })
                .attr('data-country', function () { return data[5].Average != null && data[5].Average != undefined ? data[5].Average : 0; });
              var chartSVG = chart.append('svg')
                //set width to just half the width of the window
                .attr('width', 190)
                .attr('height', 180);

              // Give each chart a title before the chart
              chart.append('div')
                .attr('class', 'chartTitleBackground')
                .append('h3')
                .attr('class', 'chartTitle')
                .text(data[5].Average);

              //call the function to create the chart
              createChart(chartSVG, data);
            }
            drawBenchmarkLine();
            console.log(benchmarkCharts)
            globalDataSet = data;
          }
        })
      })
    })
  })
}
getCountriesData();