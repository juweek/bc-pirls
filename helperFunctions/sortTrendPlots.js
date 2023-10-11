/*
------------------------
DESCRIP: a few methods for sorting graphs in 2.1-2.2, and 2.3-2.4
------------------------
  */
function getSelectedValues() {
  var sortMetric = d3.select("#sortDropdown").node().value;
  var sortOrder = d3.select("#orderDropdown").node().value;
  return { sortMetric, sortOrder };
}

function sortCharts(sortMetric, sortOrder) {
  var charts = Array.from(document.querySelectorAll(".chart"));

  charts.sort(function(a, b) {
    return sortMetric == "country" ? sortByCountry(a, b, sortOrder) : sortByYear(a, b, sortMetric, sortOrder);
  });

  return charts;
}

/*
------------------------
METHOD: sort by country since it's a string-based data
------------------------
  */
function sortByCountry(a, b, sortOrder) {
  var aVal = a.getAttribute("data-country") || "";
  var bVal = b.getAttribute("data-country") || "";

  a.classList.remove('low-opacity');
  b.classList.remove('low-opacity');

  return sortOrder == "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
}

/*
------------------------
METHOD: sort by YEAR, but remember that it really is just the sort metric
------------------------
  */
function sortByYear(a, b, sortMetric, sortOrder) {
  var aVal = parseInt(a.getAttribute("data-" + sortMetric));
  var bVal = parseInt(b.getAttribute("data-" + sortMetric));

  // Handle low-opacity based on the value
  handleOpacity(a, aVal);
  handleOpacity(b, bVal);

  return sortOrder == "asc" ? ascendingSort(aVal, bVal, a, b) : descendingSort(aVal, bVal, a, b);
}

/*
------------------------
METHOD: assign low-opacity for the countries that do not have data for a certain year
------------------------
  */
function handleOpacity(element, value) {
  //check to see if the element has a data-year attribute
  if (element.hasAttribute("data-2001_gap")) {
  }
  if (isNaN(value) || value === 0) {
    element.classList.add('low-opacity');
    if (element.hasAttribute("data-2001_gap")) {
    }
  } else {
    element.classList.remove('low-opacity');
  }
}

function ascendingSort(aVal, bVal, a, b) {
  return aVal - bVal || a.textContent.localeCompare(b.textContent);
}

function descendingSort(aVal, bVal, a, b) {
  return bVal - aVal || b.textContent.localeCompare(a.textContent);
}

/*
------------------------
METHOD: show how many countries are missing whenever a sort is made 
------------------------
  */
function displayInformation(charts, sortMetric) {

  let lowOpacityAndPresentOnSearchCount = charts.filter(chart =>
    chart.classList.contains("low-opacity") && chart.classList.contains("presentOnSearch")
  ).length;

  let presentOnSearchCount = charts.filter(chart => chart.classList.contains("presentOnSearch")).length;

  let lowOpacityCount = charts.filter(chart => chart.classList.contains("low-opacity")).length;

  // Conditionally set the finalLowOpacityCount
  let finalLowOpacityCount = 0;
  if (lowOpacityAndPresentOnSearchCount > 0) {
    finalLowOpacityCount = lowOpacityAndPresentOnSearchCount;
  } else if (presentOnSearchCount === 0 && lowOpacityCount > 0) {
    finalLowOpacityCount = lowOpacityCount;
  }

  let infoText = d3.select("#infoText");
  if (finalLowOpacityCount > 0) {
    infoText.text(`*Some countries (${finalLowOpacityCount}) are hidden because there is no data for ${sortMetric}`).style("display", "block");
  } else {
    infoText.style("display", "none");
  }
}

/*
------------------------
METHOD: reorder DOM elements 
------------------------
  */
function reorderDOMElements(charts) {
  var chartContainer = d3.select("#svganchor");
  charts.forEach(chart => chartContainer.node().appendChild(chart));
}

export { getSelectedValues, sortCharts, sortByCountry, sortByYear, handleOpacity, ascendingSort, descendingSort, displayInformation, reorderDOMElements };