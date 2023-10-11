import { createCountryDivs, sidePanelButtonHandler } from './helperFunctions/sidePanel.js';
import { showClicked, createSearchResults } from './helperFunctions/searchFilter.js';
import { sortList, sortDropdownHandler } from './helperFunctions/sort.js';
import { preprocessData, computeErrorLookup, filterAndSortData } from './helperFunctions/dataProcessingForTrendPlots.js';
import { Tooltip } from './helperFunctions/tooltip.js';
import { svgToJpegDownload, htmlToPngDownload } from './helperFunctions/takeScreenshot.js';
import { getSelectedValues, sortCharts, sortByCountry, sortByYear, handleOpacity, ascendingSort, descendingSort, displayInformation, reorderDOMElements } from './helperFunctions/sortTrendPlots.js';

/*
------------------------
METHOD: set the dimensions of the graph
------------------------
*/
var margin = { top: 10, right: 25, bottom: 0, left: 10 },
  width = 210 - margin.left - margin.right,
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
var benchmarkTitleAdded = false;

// Get references to the search input and the results dropdown
const searchInput = document.querySelector('#searchBarSelector');
const resultsDropdown = document.querySelector('#resultsSelector');

var tooltip = d3.select("#svganchor")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("width", "230px")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px");

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

  // Parse 'Average' values as numbers
  data.forEach(function(d) {
    d.Average = +d.Average;
  });
  // Filter 'Average' values above 200
  var filteredData = data.filter(function(d) { return d.Average > 200; });
  // Find min and max 'Average' values in the filtered data and adjust to be divisible by 100
  var yMin = 250; // Setting fixed min
  var yMax = 800; // Setting fixed max, not 750 as you mentioned 700

  var currentSVG = svg;

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0]);

  // Y axis with ticks at every 50
  var yTicks = currentSVG.append("g")
    .attr("transform", "translate(-6, 0)")
    .attr("class", "y-axis1")
    .call(d3.axisLeft(y)
      .tickValues(d3.range(yMin, yMax + 1, 50)) // Generate ticks at every 50
      .tickSize(6) // Adjust size of ticks
      .tickFormat("") // Remove labels
    );

  // Y axis with labels at every 100
  var yAxis = currentSVG.append("g")
    .attr("transform", "translate(-6, 0)")
    .attr("class", "y-axis1")
    .call(d3.axisLeft(y)
      .tickValues([yMin, 700]) // Only at 250 and 650
      .tickSize(0) // Hide ticks
    );

  // Modify the y-axis labels to move them to the right of the axis line
  yAxis.selectAll("text")
    .style("text-anchor", "start")
    .style("font-family", "PT Sans")
    .attr("dx", "1.4em"); // This moves the labels to the right by "2em". Adjust as necessary.

  // Flip the tick marks to the right side of the axis line
  yTicks.selectAll(".tick line")
    .attr("x1", "0px") // This moves the tick lines to start at the same point as the labels.
    .attr("x2", "1em"); // This makes the tick lines have zero length, effectively hiding them.


  var svgWidth = currentSVG.node().getBoundingClientRect().width; // Get the full SVG width

  // Add X axis --> it is a date format
  var x = d3.scaleLinear()
    .domain([1998, 2026])
    .range([0, width]);

  // Append rectangle for the background and border
  currentSVG.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", svgWidth)
    .attr("height", 20) // Adjust as needed
    .attr("fill", "#e6e6e6")
    .attr("stroke-width", 1)
    .attr("stroke", "black")
    .attr("stroke-dasharray", "0, 0, 1, 0"); // This will create a bottom border

  // Axis for the labels
  var xAxis = currentSVG.append("g")
    .attr("transform", "translate(35, -1)")  // Position the labels at the middle of the grey bar
    .attr("class", "x-axis1")
    .call(
      d3.axisBottom(x)
        .tickFormat(function(d) { return d.toString().replace(/,/g, ''); }) // remove commas from tick labels
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
  let newDataReady = dataReady.map(function(series) {
    return {
      ...series,
      values: series.values.filter(function(d) {
        return !isNaN(d.value) && d.value !== null && d.value !== '0' && d.value !== 0;
      })
    };
  });

  let newDataReady2 = dataReady2.map(function(series) {
    return {
      ...series,
      values: series.values.filter(function(d) {
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

  // Compute errorLookup
  let errorLookup = newDataReady[0].values
    .filter(d => d.time.endsWith('_error'))
    .reduce((acc, d) => {
      acc[d.time.replace('_error', '')] = d.value;
      return acc;
    }, {});

  let wave = newDataReady[0].values.find(v => v.time === 'Wave').value;

  for (let i = 0; i < sortedData.length - 1; i++) {
    if (['Wave', 'Country', 'Benchmark'].includes(sortedData[i].time)) continue;

    let segmentData = [sortedData[i], sortedData[i + 1]];
    let segment = d3.line()
      .defined(function(d) { return !isNaN(d.value) && d.value != null && d.value !== '0'; })
      .x(function(d) { return x(+d.time); })
      .y(function(d) { return y(+d.value); });

    currentSVG.append("path")
      .attr("d", segment(segmentData))
      .attr("stroke", +segmentData[1].time === 2021
        ? (wave === '2' ? 'grey' : '#000')
        : '#000')
      .style("stroke-width", 2)
      .style("stroke-dasharray", +segmentData[1].time === 2021 ? "2,2" : "none")
      .style("fill", "none")
      .attr("transform", "translate(35, 0)");
  }

  for (let i = 0; i < sortedData2.length - 1; i++) {
    if (['Wave', 'Country', 'Benchmark'].includes(sortedData2[i].time)) continue;

    let segmentData2 = [sortedData2[i], sortedData2[i + 1]];
    let segment2 = d3.line()
      .defined(function(d) {
        let time = d.time;
        if (typeof time === 'string' && time.endsWith('g')) {
          time = time.slice(0, -1);
        }
        return !isNaN(+time) && !isNaN(+d.value) && d.value != null && d.value !== '0';
      })
      .x(function(d) {
        let time = d.time;
        if (typeof time === 'string' && time.endsWith('g')) {
          time = time.slice(0, -1);
        }
        return x(+time);
      })
      .y(function(d) { return y(+d.value); });

    const yearStr = segmentData2[1].time.slice(0, -1); // Remove the 'g'
    const yearInt = parseInt(yearStr, 10);

    currentSVG.append("path")
      .attr("d", segment2(segmentData2))
      .attr("stroke", yearInt === 2021
        ? (wave === '2' ? '#E9CBCC' : '#9D0505')
        : '#9D0505')
      .style("stroke-width", 2)
      .style("stroke-dasharray", yearInt === 2021 ? "2,2" : "none")
      .style("fill", "none")
      .attr("transform", "translate(35, 0)");
  }


  var benchmarkLine = document.querySelector("#benchmark-line");

  var el = currentSVG;  // Assign currentSVG to el
  dataReady[0].values.forEach(function(v) {  // Assuming dataReady[0] is the data for the currentSVG
    el.attr(`data-${v.time}`, v.value);  // Use a template string to set the attribute name
  });

  // First we need to enter in a group
  currentSVG
    .selectAll("myDots")
    .data(dataReady)
    .enter()
    .append('g')
    .style("fill", function(d) { return '#121212' })
    .selectAll("myPoints")
    .data(function(d) {
      if (d) {
        return d.values;
      } else {
        return null;
      }
    })
    .enter()
    .each(function(d) {
      let selection = d3.select(this);
      let time = d.time;
      let isGirlData = typeof time === 'string' && time.endsWith('g');
      let numericTime = isGirlData ? +time.slice(0, -1) : +time;
      let yPos = y(+d.value);

      if (isGirlData) {
        let fillColor = (time === '2021g' && wave === '2') ? '#E9CBCC' : '#9D0505'; // For circle
        selection.append("circle")
          .attr("class", "myDots")
          .attr("cx", x(numericTime) - 3)
          .attr("cy", yPos - 3)
          .attr("r", 3)
          .attr("stroke", "white")
          .attr("fill", fillColor)
          .attr("transform", "translate(39, 2)")
          .attr("data-value", d.value)
          .attr("data-time", d.time)
          .style("opacity", isNaN(+d.value) || +d.value === 0 ? 0 : 1);
      } else {
        let fillColor = (time === '2021' && wave === '2') ? '#333' : '#000'; // For rectangle
        selection.append("rect")
          .attr("class", "myDots")
          .attr("x", x(numericTime) - 3)
          .attr("y", yPos - 3)
          .attr("width", 6)
          .attr("height", 6)
          .attr("stroke", "white")
          .attr("fill", fillColor)
          .attr("transform", "translate(35, 0)")
          .attr("data-value", d.value)
          .attr("data-time", d.time)
          .style("opacity", isNaN(+d.value) || +d.value === 0 ? 0 : 1);
      }
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
    .data(function(d) {
      if (d) {
        return d.values
      }
      else {
        return 0
      }
    })
    .enter()
    .append("g")  // Create a new group for each text and its background
    .each(function(d) {
      // Append rectangle as a background first
      let validTimes = ['2001', '2006', '2011', '2016', '2021'];
      let time = d.time;
      if (typeof time === 'string' && time.endsWith('g')) {
        time = time.slice(0, -1);
      }
      // Only process this data point if its 'time' value is a valid time
      if (!validTimes.includes(time)) {
        return;
      }

      // Append text element after the rectangle
      d3.select(this).append("text")
        .attr("x", function() {
          let time = d.time;
          if (typeof time === 'string' && time.endsWith('g')) {
            time = time.slice(0, -1);
          }
          return x(+time) + 5;
        })
        .attr("y", function() {
          let time = d.time;
          if (typeof time === 'string' && time.endsWith('g')) {
            return y(d.value) - 1;  // Adjust the n
          } else {
            return y(d.value) + 30;  // Adjust the n
          }
        })
        .text(function() { return d.value })
        .attr("text-anchor", "middle")
        .attr("font-size", "10.5px")
        .attr("font-weight", "bold")
        .attr("font-family", "PT Sans")
        .attr("fill", function() {
          let time = d.time;
          return (typeof time === 'string' && time.endsWith('g')) ? "#9D0505" : "#121212";  // Change fill color based on 'g' condition
        })
        .attr("class", "textLine")
        .attr("data-value", function() { return d.value })
        .attr("data-time", function() { return d.time })
        .attr("data-name", function() { return d.name })
        .attr("transform", "translate(30, -10)");
    });

  /*
------------------------
METHOD: create the tooltip and hover functions
------------------------
  */

  const tooltipHandler = new Tooltip(svg, height);

  // Event handlers

  const mouseover = function(d) {
    const currentYear = d3.select(this).attr("data-time");
    const currentScoreBoy = d3.select(this).attr("data-2001");
    const currentScoreGirl = d3.select(this).attr("data-2001g");
    const content = `PIRLS ${currentYear} average achievement: <b>${currentScoreBoy}</b> and <b>${currentScoreGirl}</b>`;
    tooltipHandler.displayTooltip(content, window.event.clientX, window.event.clientY + 450);
  }

  const mousemove = function(d) {
    const xPos = d3.mouse(this)[0] - 30;
    tooltipHandler.setVerticalLinePosition(xPos);
    const currentDate = x.invert(xPos);
    const roundedYear = tooltipHandler.roundToNearestYear(currentDate); // Using your roundToNearestYear function
    const hasGenderData = d3.select(this).attr(`data-${roundedYear}g`);

    const content = hasGenderData
      ? tooltipHandler.generateTooltipContentGender(this, roundedYear)
      : tooltipHandler.generateTooltipContent(this, roundedYear);

    tooltipHandler.displayTooltip(content, window.event.clientX, window.event.clientY + 450);

    if (hasGenderData) {
      tooltipHandler.tooltip.classList.add('gender-tooltip');  // Directly adding class
    } else {
      tooltipHandler.tooltip.classList.remove('gender-tooltip');  // Directly removing class
    }
  }

  const mouseleave = function(d) {
    tooltipHandler.hideTooltip();
    tooltipHandler.hideVerticalLine();
    tooltipHandler.tooltip.classList.remove('gender-tooltip');  // Directly removing class
    d3.select(this).style("stroke", "none").style("opacity", 1);
  }

  // Attach event listeners
  currentSVG.selectAll(".myDots")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  currentSVG
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
}

/*
 ------------------------
 METHOD: create a click event listener for datavizCopy that prints out the graph
 ------------------------
 */
document.getElementById('downloadButton1').addEventListener('click', function() {
  const svgElement = document.querySelector('#svganchor');
  //svgToJpegDownload(svgElement, '2021PIRLS_Achievement_2_1.png');
  document.body.style.cursor = 'wait';
  htmlToPngDownload(svgElement, '2021PIRLS_GenderGap_2_3.png');
  //downloadAllCharts('2021PIRLS_Achievement_2_1.png')
});


/*
------------------------
METHOD: call the function that creates the charts for the first time. you have two containers, for benchmark and nonbenchmark particapants.
------------------------
*/
async function getCountriesData() {
  var transformedData = {};

  // Append the chart to the corresponding benchmark div based on the data-benchmark attribute
  function appendToBenchmarkDiv(chart, benchmark0Div, benchmark1Div) {
    const chartNode = chart.node();
    const benchmarkValue = parseInt(chartNode.getAttribute("data-benchmark"));
    if (benchmarkValue == 0) {
      benchmark0Div.node().appendChild(chartNode);
    } else if (benchmarkValue == 1) {
      benchmark1Div.node().appendChild(chartNode);
      addBenchmarkTitleIfNecessary(benchmark1Div);
    }
  }

  function addBenchmarkTitleIfNecessary(benchmark1Div) {
    const benchmark1DivNode = benchmark1Div.node();
    const parentElement = benchmark1DivNode.parentElement;
    if (!document.querySelector('.benchmarkTitle')) {
      if (parentElement && !benchmark1DivNode.querySelector('.benchmarkTitle') && !benchmarkTitleAdded) {
        const benchmarkTitle = document.createElement('div');
        benchmarkTitle.className = "benchmarkTitle";
        benchmarkTitle.innerHTML = "Benchmarking Participants";
        parentElement.insertBefore(benchmarkTitle, benchmark1DivNode);
        benchmarkTitleAdded = true;
      }
    }
  }

  function updateBenchmarks(sortedCharts, benchmark0Div, benchmark1Div) {
    benchmarkTitleAdded = false;
    sortedCharts.forEach(chartNode => appendToBenchmarkDiv(d3.select(chartNode), benchmark0Div, benchmark1Div));
  }

  d3.csv("https://html-css-js.jadesign.repl.co/data/gender.csv", function(error, data) {
    if (error) throw error;

    var countries = [];

    // Transform the data
    data.forEach(function(row) {
      var country = row["Country"];
      var headers = Object.keys(row);
      transformedData[country] = headers.map(function(header) {
        return { time: header, Average: row[header], Benchmark: row['Benchmark'] };
      });
    });

    var globalDataSet = transformedData

    // Push the lowercase version of the country into the array
    data.forEach(country => {
      countries.push(country.Country.toLowerCase());
    });

    var container = d3.select("#svganchor");
    var benchmark0Div = createBenchmarkDiv(container, 0);
    var benchmark1Div = createBenchmarkDiv(container, 1);

    const years = ['2001', '2006', '2011', '2016', '2021', '2006g', '2011g', '2016g', '2021g']; // Added gender years too

    for (var country in transformedData) {
      var data = transformedData[country];
      var chart = container.append("div")
        .attr("class", "chart")
        .attr("id", country + "-chart");

      years.forEach((year, index) => {
        chart.attr(`data-${year}`, function() {
          console.log(year)
          console.log(index)
          console.log(data)
          console.log('//////')
          return (data[index] && data[index].Average != null && data[index].Average != undefined) ? data[index].Average : 0;
        });
      });

      chart.attr("data-benchmark", data[7].Average || 0)
        .attr("data-country", country)
        .attr("data-currentWave", data[6].Average || 0)
        .attr("data-2001_gap", data[23].Average)
        .attr("data-2006_gap", data[24].Average)
        .attr("data-2011_gap", data[25].Average)
        .attr("data-2016_gap", data[26].Average)
        .attr("data-2021_gap", data[27].Average)


      var chartSVG = chart.append("svg")
        .attr("width", 190) // Assuming this width as the value for 'width' was missing
        .attr("height", 180); // Assuming this height as the value for 'height' was missing

      // Give each chart a title before the chart
      chart.append("div")
        .attr("class", "chartTitleBackground")
        .append("h3")
        .attr("class", "chartTitle")
        .text(data[5].Average);

      createChart(chartSVG, data);
      appendToBenchmarkDiv(chart, benchmark0Div, benchmark1Div);
    }

    function createBenchmarkDiv(container, benchmark) {
      var benchmarkDiv = container.append("div");
      benchmarkDiv.attr("id", `benchmark${benchmark}`)
        .attr("class", "benchmarkGroup");
      return benchmarkDiv;
    }

    /*
  ------------------------
  METHOD: create the dropdowns that determine how we will display the year. first, distinguish what type of sort it is
  ------------------------
  */

    d3.selectAll(".dropdownMenu").on("change", function() {
      let { sortMetric, sortOrder } = getSelectedValues();
      let sortedCharts = sortCharts(sortMetric, sortOrder);
      displayInformation(sortedCharts, sortMetric);
      reorderDOMElements(sortedCharts);
      updateBenchmarks(sortedCharts, benchmark0Div, benchmark1Div);
    });

    /*
 ------------------------
 SEARCH RESULTS BUTTONS: Select all buttons in the searchResults area. attach a click event listener to each button so, when clicked, it adds the country to the currentlySelectedCountries section, then redraws the chart
 ------------------------
 */

    const searchInput = document.querySelector('#searchBarSelector');
    const resultsDropdown = document.querySelector('#resultsSelector');
    let currentClickedButtons = [];

    function updateChartVisibility() {
      d3.selectAll('.chart').each(function() {
        const chart = d3.select(this);
        const chartCountry = chart.attr("data-country");

        if (currentClickedButtons.includes(chartCountry)) {
          chart.style('display', 'flex');
          chart.classed('presentOnSearch', true);
        } else {
          chart.style('display', 'none');
          chart.classed('presentOnSearch', false);
        }
      });

      if (currentClickedButtons.length === 0) {
        d3.selectAll('.chart').style('display', 'flex');
        d3.select("#clearSelections").remove();
        d3.selectAll('.resultButton').classed('resultButtonSelected', false);
        currentClickedButtons = [];
        d3.select('.dropdownMenu').dispatch('change');
      }
    }

    function attachSelectedCountryEventListeners() {
      const selectedResultsButtons = d3.selectAll('.selectedCountry');
      selectedResultsButtons.on('click', function() {
        let currentCountryButton = d3.select(this);
        let currentCountryButtonName = currentCountryButton.text();

        let index = currentClickedButtons.indexOf(currentCountryButtonName);
        if (index > -1) {
          currentClickedButtons.splice(index, 1);
        }

        currentCountryButton.remove();
        d3.select(`[data-country='${currentCountryButtonName}']`).classed('resultButtonSelected', false);

        updateChartVisibility();
        showClicked(currentClickedButtons, data);
        attachSelectedCountryEventListeners();
        d3.select('.dropdownMenu').dispatch('change');
      });
    }

    searchInput.addEventListener('input', event => {
      const inputValue = event.target.value;
      createSearchResults(data, inputValue, countries, resultsDropdown);

      const searchResultsButtons = d3.selectAll('.resultButton');

      searchResultsButtons.on('click', function() {
        if (d3.selectAll(".selectedCountry").size() == 0) {
          currentClickedButtons = [];
        }

        let button = d3.select(this);
        button.classed("resultButtonSelected", true);

        const clickedCountry = button.text();
        if (!currentClickedButtons.includes(clickedCountry)) {
          currentClickedButtons.push(clickedCountry);
        }

        updateChartVisibility();
        showClicked(currentClickedButtons, data);
        attachSelectedCountryEventListeners();

        console.log(currentClickedButtons)
        d3.select('.dropdownMenu').dispatch('change');
      });
    });
  })
}


/*
------------------------
CLICK EVENT TO CLOSE SEARCH RESULTS: Listen for clicks on the entire document
------------------------
*/
let ignoreNextDocumentClick = false;

// Existing code for the 'focus' event on searchInput
searchInput.addEventListener('focus', function() {
  resultsDropdown.style.display = 'block'; // Adjust as per your CSS
  ignoreNextDocumentClick = true;  // Set the flag
});

// Existing code for the 'click' event on document
document.addEventListener('click', function(event) {
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

// Get references to checkboxes
var checkbox1 = document.getElementById('option1');
var checkbox2 = document.getElementById('option2');

// Function to handle change event
function handleChange() {
  // Get all divs with the class 'chart'
  var charts = document.getElementsByClassName('chart');

  // Iterate over all divs
  for (var i = 0; i < charts.length; i++) {
    // Get the data-currentWave attribute
    var wave = charts[i].getAttribute('data-currentWave');

    // If checkbox1 is checked and wave is '1', or if checkbox2 is checked and wave is '2', 
    // show the div, otherwise hide it
    if ((checkbox1.checked && wave === '1') || (checkbox2.checked && wave === '2')) {
      charts[i].style.display = 'flex';
    } else {
      charts[i].style.display = 'none';
    }
  }
}

// Add event listeners to checkboxes
checkbox1.addEventListener('change', handleChange);
checkbox2.addEventListener('change', handleChange);

getCountriesData();