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
  //detect if data is an object)
  if (data[0] == undefined) {
    // Assume inputObject is the object in Form A
    const outputArray = [];
    for (const country in data) {
      const currentData = data[country];
      const countryData = {};
      for (const item of currentData) {
        countryData[item.time] = item.Average;
      }
      countryData['Country'] = country;
      outputArray.push(countryData);
    }
    data = outputArray;
  }

  const sortedList = data.sort((a, b) => {
    // special case for 'Country' property
    if (property === 'Country') {
      if (order === 'asc') {
        return a[property].localeCompare(b[property]);
      } else {
        return b[property].localeCompare(a[property]);
      }
    }

    // for other properties, convert string to number and compare
    const aValue = Number(a[property]);
    const bValue = Number(b[property]);

    if (order == 'asc') {
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
      return 0;
    }

    if (order == 'desc') {
      if (aValue < bValue) return 1;
      if (aValue > bValue) return -1;
      return 0;
    }
  });


  return sortedList;
}


/*
 ------------------------
 METHOD: get the position of the line based on order
 */
function getLastBenchmarkYPosition(data, yScale) {
  // Initialize benchmarkY to 0
  var benchmarkY = 0;
  var countryName = '';
  var countryPosition = 0;

  for (var i = 0; i < data.length; i++) {
    // If the current country is a benchmark, update benchmarkY
    if (data[i].Benchmark == 1) {
      benchmarkY = yScale(data[i].Country);
      countryName = data[i].Country;
      countryPosition = i;
      break;
    }
  }
  // Return the y position of the benchmark line
  return benchmarkY;
}


/*
------------------------
METHOD: add the button handler to the side panel button
------------------------
*/
function sortDropdownHandler(orderDropdown, globalDataSet) {
  var sortDropdown = d3.select("#sortDropdown");
  let value = sortDropdown.property("value")
  let newData = []
  console.log(value)
  console.log(orderDropdown.property("value"))
  console.log(globalDataSet)
  console.log('----------------')
  //first, check if the orderDropdown is set to asc or desc, then call the sort function you created above
  if (orderDropdown.property("value") === "asc") {
    newData = sortList(globalDataSet, value, "asc")
  } else {
    newData = sortList(globalDataSet, value, "desc")
  }
  return newData;
}

// Exporting variables and functions
export { sortList, sortDropdownHandler, getLastBenchmarkYPosition };