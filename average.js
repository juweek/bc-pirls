
/*
------------------------
METHOD: set the dimensions of the graph
------------------------
*/
var margin = { top: 10, right: 20, bottom: 10, left: 10 },
    width = 300 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;

let allGroup = ["Average"]
let currentCountry = 'belgium'

//create an array of all the countries
let countries = []

/*
------------------------
METHOD: //select all the dropdowns 
------------------------
*/
var sortDropdown = d3.select("#sortDropdown");
var orderDropdown = d3.select("#orderDropdown");
var listOfDropdowns = sortDropdown.selectAll(".dropdown")
let clickedButtons = [];
/*
------------------------
METHOD: create something for camelCase
------------------------
  */
function toTitleCase(str) {
    // Convert the string to Title Case using a regular expression
    return str.replace(/\b[a-z]/g, char => char.toUpperCase());
}

var svg = d3.select("#svganchor")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

/*
------------------------
METHOD: show all of the clicked buttons in a div
------------------------
  */
function showClicked(currentClickedButtons, data) {
    //clear out the div
    d3.select("#searchBarResults").selectAll("*").remove();
    //add the new divs
    d3.select("#searchBarResults")
      .selectAll("div")
      .data(currentClickedButtons)
      .enter()
      .append("div")
      //set the font sizea
      .text(function (d) {
        //get the name of the country from d
        return d;
      })
      .on("click", function (d) {
        //remove the current clicked button from the list
        let index = clickedButtons.indexOf(d);
        if (index > -1) {
          clickedButtons.splice(index, 1);
        }
        //check the text in the search bar and see if the substring is in the text of the button you just clicked
        let currentSearchText = d3.select("#searchBarSelector").property("value").toLowerCase();
        //check if currentSearchText is a substring of d
        if (d.toLowerCase().includes(currentSearchText)) {
          //if it is, add the button to resultsDropdown 
          let resultsDropdown = d3.select("#searchBarResults")._groups[0][0];
          let html = `<button class="resultButton">${toTitleCase(d)}</button>`;
          resultsDropdown.innerHTML += html;
      }
  
        //recall the method to show the buttons in the search bar
        let searchValue = d3.select("#searchBarSelector").property("value");
        let countriesList = data.map(d => d.Country.toLowerCase());
        let resultsDropdown = d3.select("#searchBarResults")._groups[0][0];
  
        //create an array of all the countries
        let countries = []
        data.forEach(country => {
          //push the lowercase version of the country into the array
          countries.push(country.Country.toLowerCase())
        })
  
        //check to see if the button you just clicked matches the search bar
        const filteredResults = countriesList.filter(result => result.includes(searchValue.toLowerCase()));
        createSearchResults(searchValue, countriesList, resultsDropdown);
  
        //if there are no moe clicked buttons, you set the data to the master data set
        showClicked(clickedButtons, data);
      })
    //if there are no more clicked buttons, you set the data to the master data set
    var tempfilteredData = [];
    if (currentClickedButtons.length == 0) {
      globalDataSet = masterDataSet;
    } else {
      tempfilteredData = masterDataSet.filter(item => currentClickedButtons.includes(item.Country));
      //console.log(tempfilteredData)
      globalDataSet = tempfilteredData;
    }
    if (tempfilteredData.length == 0) {
      createChart(svg, masterDataSet);
      //createCountryDivs(masterDataSet);
    }
    else {
      createChart(svg, tempfilteredData);
      //createCountryDivs(tempfilteredData);
    }
  }



/*
------------------------
METHOD: sort data to use after a dropdown is selected
------------------------
  */
function sortList(data, property, order) {
    // Sort the list of objects based on the specified property and sort order
    if (order !== 'asc' && order !== 'desc') {
      throw new Error('Invalid sort order. Must be "asc" or "desc"');
    }

    const outputData = [];
    
    for (const [country, newData] of Object.entries(data)) {
      outputData.push({
        country: country,
        '2006': newData[0],
        '2011': newData[1],
        '2016': newData[2],
        '2021': newData[3]
      });
    }
    //rearrange the data so it is rearranged in  order depending on the property parameter
    const sortedList = outputData.sort((a, b) => {
        // If the sort order is 'asc', return -1 if a comes before b,
        // 0 if a and b are equal, and 1 if a comes after b
        if (order === 'asc') {
          if (a[property] < b[property]) return -1;
          if (a[property] > b[property]) return 1;
          return 0;
        }
        // If the sort order is 'desc', return 1 if a comes before b,
        // 0 if a and b are equal, and -1 if a comes after b
        if (order === 'desc') {
          if (a[property] < b[property]) return 1;
          if (a[property] > b[property]) return -1;
          return 0;
        }
      });
      console.log(sortedList)
      return sortedList;
  }

  
/*
------------------------------
METHOD: create a dropdown selector that calls the update method. This dropdown will redraw the d3 graph whenever a new country is selected
------------------------------
*/
let dropdown = d3.select("#dropdown");
dropdown
    .selectAll("option")
    .data(Object.keys(countries))
    .enter()
    .append("option")
    .attr("value", function (d) {
        return d;
    })
    .text(function (d) {
        return d;
    });

dropdown.on("change", function () {
    let selectedCountry = d3.select(this).property("value");
    currentCountry = countries[selectedCountry]
    d3.csv("https://html-css-js.jadesign.repl.co/data/" + currentCountry + ".csv").then(function (data) {
        createChart(svg, data);
    })
        .catch(function (error) {
            console.log(error);
        })
});

/*
------------------------
METHOD: create the results for the searchbar menu
------------------------
  */
function createSearchResults(searchValue, countriesList, resultsDropdown) {
    const inputValue = searchValue;

    let html = '';

    const filteredResults = countriesList.filter(result => result.includes(inputValue.toLowerCase()));

    //if the search inputValue is empty, then don't show the results and instead show 'no results'
    if (inputValue === '') {
        resultsDropdown.innerHTML = '';
        return;
    }
    else if (filteredResults == '') {
        resultsDropdown.innerHTML = 'No results';
        return;
    }
    else {
        //change string to titleCase
        filteredResults.forEach(result => {
            // Create a new button for each result
            html += `<button class="resultButton" id="${toTitleCase(result)}">${toTitleCase(result)}</button>`;
        });
        // Update the results dropdown with the new HTML
        resultsDropdown.innerHTML = html;
    }
    // Select all buttons with the class "resultButton"
    const buttons = d3.selectAll('.resultButton');

    // Attach a click event listener to each button
    buttons.on('click', function () {
        let button = d3.select(this);
        //add the current clicked button to the list of clicked buttons
        clickedButtons.push(button._groups[0][0].innerHTML);
        //hide the current clicked button
        button.style("display", "none");
        //call the function to filter the buttons that have been clicked
        showClicked(clickedButtons, globalDataSet);
    });
}


/*
------------------------
METHOD: create the line graphs using the filters and search bars
------------------------
  */
function createChart(svg, data) {
    //d3.select("#svganchor svg").selectAll("*").remove();
    console.log(data)

    //set width and height to the svg parameters
    let width = svg.attr("width") - margin.right;
    let height = svg.attr("height") - margin.top - margin.bottom;

    var dataReady = [{
        name: 'Average',
        values: data.map(d => ({ time: d.time, value: d.Average }))
    }
    ];
    // A color scale: one color for each group

    var currentSVG = svg;

    // Add X axis --> it is a date format
    var x = d3.scaleLinear()
        .domain([1998, 2024])
        .range([0, width]);
    currentSVG.append("g")
        .attr("transform", "translate(-3," + (height) + ")")
        .attr("class", "x-axis1")
        .attr('width', width)
        .call(d3.axisBottom(x)
            .tickFormat(function (d) { return d.toString().replace(/,/g, ''); }) // remove commas from tick labels
            .tickValues([2001, 2006, 2011, 2016, 2021])
        );

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([300, 730])
        .range([height, 0])
    currentSVG.append("g")
        //translate the y axis to the left side of the graph
        .attr("transform", "translate(35, 0)")
        .attr("class", "y-axis1")
        .call(d3.axisLeft(y));

    // Add the lines
    var line = d3.line()
        .x(function (d) { return x(+d.time) })
        .y(function (d) { 
            if(d.value == 0){
                return y(+300) 
            } 
            //check if d.value is not a number
            else if(isNaN(d.value)){
                return y(+300) 
            }
            else {
                return y(+d.value) 
            }
        })

    currentSVG.selectAll("myLines")
        .data(dataReady)
        .enter()
        .append("path")
        .attr("d", function (d) {
            return line(d.values)
        })
        .attr("stroke", function (d) { return 'black' })
        .style("stroke-width", 4)
        .style("fill", "none")

    // Add the points
    currentSVG
        // First we need to enter in a group
        .selectAll("myDots")
        .data(dataReady)
        .enter()
        .append('g')
        .style("fill", function (d) { return 'black' })
        // Second we need to enter in the 'values' part of this group
        .selectAll("myPoints")
        .data(function (d) {
            if(d){
                return d.values
            }
            else{
                return 0
            }
        })
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.time) })
        .attr("cy", function (d) { 
            if(d.value == 0){
                return y(300)
            } 
            //check if d.value is not a number
            else if(isNaN(d.value)){
                return y(300)
            }
            else {
                return y(d.value) 
            }
        })
        .attr("r", 6)
        .attr("stroke", "white")
        .attr("data-value", function (d) { return d.value })

    //for each circle point, display a text element 
    // Add the points
    currentSVG
        // First we need to enter in a group
        .selectAll("myText")
        .data(dataReady)
        .enter()
        .append('g')
        // Second we need to enter in the 'values' part of this group
        .selectAll("myPoints")
        .data(function (d) {
            if(d){
                return d.values
            }
            else{
                return 0
            }
        })
        .enter()
        //for each circle point, display a text element with the value of the point, and display a circle
        .append("text")
        .attr("x", function (d) { return (x(d.time) + 7) })
        .attr("y", function (d) { return y(d.value) - 5 })
        .text(function (d) { return d.value })
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .attr("class", "textLine")
        .attr("data-value", function (d) { return d.value })
        .attr("data-time", function (d) { return d.time })
        .attr("data-name", function (d) { return d.name })
        .attr("transform", "translate(0, -10)")



    // Add a legend at the end of each line
    currentSVG
        .selectAll("myLabels")
        .data(dataReady)
        .enter()
        .append('g')
        .append("text")
        .datum(function (d) { return { name: d.name, value: d.values[d.values.length - 1] }; }) // keep only the last value of each time series
        .attr("transform", function (d) { return "translate(" + x(d.value.time) + "," + y(d.value.value) + ")"; }) // Put the text at the position of the last point
        .attr("x", - 120) // shift the text a bit more right
        .attr("y", - 40) // shift the text a bit higher
        .text(function (d) { return d.name; })
        .style("fill", function (d) { return 'black' })
        .style("font-size", 18);

    /*
    ------------------------------
    Section: add a tooltip for each circle in the graph
    ------------------------------
    */
    var tooltip = d3.select("#svganchor")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d) {
        tooltip.style("opacity", 1)
        d3.select(this).style("fill", "red")
    }
    var mousemove = function (d) {
        //show the score in a two decimal format
        let currentScore = d3.select(this).attr("data-value")
        let roundedScore = Math.round(currentScore * 100) / 100
        tooltip
            .html("The average score for <br>this cell is: <b>" + roundedScore + "</b>")
            .style("left", ((d.pageX - 40) + "px"))
            .style("top", ((d.pageY - 40) + "px"))
    }

    var mouseleave = function (d) {
        tooltip
            .style("opacity", 0)
        d3.select(this).style("fill", null)
    }

    //attach the event listeners to the circles
    currentSVG.selectAll("circle")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

    // Add X axis --> it is a date format
    var x = d3.scaleTime()
}


var masterCountryList = ['belgium', 'china', 'india', 'kenya'];
var globalDataSet
var masterDataSet

async function getCountriesData() {
    var countriesData = {};

    for (var i = 0; i < masterCountryList.length; i++) {
        var country = masterCountryList[i];

        // Get the data for the current country
        var data = await d3.csv('https://html-css-js.jadesign.repl.co/data/' + country + '.csv');
        countriesData[country] = data;
    }
    var transformedData = {};

    d3.csv("https://html-css-js.jadesign.repl.co/data/averageAchievement.csv", function (error, data) {
        if (error) throw error;

        var headers = Object.keys(data[0]);

        // remove the first header "Country"
        headers.shift();

        masterDataSet = data

        // transform the data
        data.forEach(function (row) {
            var country = row["Country"];
            transformedData[country] = [];
            headers.forEach(function (header, index) {
                transformedData[country].push({ time: header, Average: row[header] });
            });
        });

        globalDataSet = transformedData


        data.forEach(country => {
            //push the lowercase version of the country into the array
            countries.push(country.Country.toLowerCase())
        })

        /*
------------------------
METHOD: create the dropdowns that determine if we will sort or search
------------------------
*/
        d3.selectAll(".dropdownMenu").on("change", function () {
            let value = sortDropdown.property("value")
            let newData = []
            //first, check if the orderDropdown is set to asc or desc
            if (orderDropdown.property("value") === "asc") {
                //call the sort function you created above
                newData = sortList(globalDataSet, value, "asc")
            } else {
                newData = sortList(globalDataSet, value, "desc")
            }
            //let searchValue = searchBar.property("value")
            //newData = globalDataSet.filter(country => country.Country.toLowerCase().includes(searchValue.toLowerCase()));
            //currentDataSet = newData
            //update the svg
            createChart(chartSVG, newData);
        });

        // For each country, create a chart and display it
        for (var country in transformedData) {
            var data = transformedData[country];
            var chart = d3.select('#svganchor').append('div')
                .attr('class', 'chart')
                .attr('id', country + '-chart');
            var chartSVG = chart.append('svg')
                //set width to just half the width of the window
                .attr('width', 240)
                .attr('height', 200);

            // Give each chart a title before the chart
            chart.append('div')
                .attr('class', 'chartTitleBackground')
                .append('h3')
                .attr('class', 'chartTitle')
                .text(country);

            createChart(chartSVG, data);
        }
    })
}
// Get references to the search input and the results dropdown
const searchInput = document.querySelector('#searchBarSelector');
const resultsDropdown = document.querySelector('#resultsSelector');
getCountriesData();


// Add an event listener to the search input that filters the results
// whenever the input value changes
searchInput.addEventListener('input', event => {
    const inputValue = event.target.value;
    createSearchResults(inputValue, countries, resultsDropdown);
});

/*
      //give each chart an x and y axis
      chart.append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0, 300)')
        .call(d3.axisBottom(xScale));
      chartSVG.append('g')
        .attr('class', 'y-axis')
        .attr('transform', 'translate(50, 0)')
        .call(d3.axisLeft(yScale));
        */