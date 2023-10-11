/*
------------------------
METHOD: turn whole numbers into single point decimal ones
------------------------
*/
function formatNumber(input) {
  let n = parseFloat(input); // Convert string to float number

  // Check if conversion was successful and it's an integer
  if (!isNaN(n) && Number.isInteger(n)) {
    return n + ".0";
  }
  return input; // If the input wasn't a valid number or wasn't an integer, return the original input
}


/*
------------------------
METHOD: create the table that shows the country data
------------------------
*/
function createCountryDivs(data) {
  //remove the existing divs except the first one
  var tableData = document.getElementById('tableContent'); // Changed from 'datavizCopy' to 'tableContent'
  while (tableData.children.length > 1) {
    tableData.removeChild(tableData.lastChild);
  }
  var benchmarkIndex = data.findIndex(d => d.Benchmark == 1);  // Find the first benchmark country

  data.forEach(function(d, index) {
    var div = document.createElement("div");
    //give the div a class of 'country'
    if (index == benchmarkIndex) {
      var blankDiv = document.createElement("div");
      blankDiv.style.height = "18px";  // Adjust this to your needs
      blankDiv.style.borderTop = '1px solid black';
      blankDiv.style.borderBottom = '2px solid black';
      var textPara = document.createElement("p");
      textPara.textContent = "Benchmarking Participants";
      textPara.style.margin = 0;
      textPara.style.font = "bold 14px PT Sans";
      blankDiv.appendChild(textPara);
      tableData.appendChild(blankDiv);
    }

    div.classList.add("tableCountry");
    if (d.Wave == 2) {
      div.classList.add("wave2");
    }
    //if the data has d.intermediate, fill in the following inner html
    if (d.intermediate) {
      div.innerHTML =
        `<p><sup>${d.prefix} </sup>${d.Country}</p>
        <p>${d.advanced ? Math.round(d.advanced) : ''} ${d.advanced_se ? '(' + formatNumber(d.advanced_se) + ')' : ''}</p>
        <p>${d.high ? Math.round(d.high) : ''} ${d.high_se ? '(' + formatNumber(d.high_se) + ')' : ''}</p>
        <p>${d.intermediate ? Math.round(d.intermediate) : ''} ${d.intermediate_se ? '(' + formatNumber(d.intermediate_se) + ')' : ''}</p>
        <p>${d.low ? Math.round(d.low) : ''} ${d.low_se ? '(' + formatNumber(d.low_se) + ')' : ''}</p>`;
    }
    else {
      div.innerHTML =
        `<p><sup>${d.prefix} </sup>${d.Country}</p>
        <p>${d.average} (${d.standardError})</p>
        <p>${d.fifth_percentile}</p>
        <p>${d.twentyfitfh_percentile}</p>
        <p>${d.ninetyfifth_lower} - ${d.ninetyfifth_higher}</p>
        <p>${d.seventyfifth}</p>
        <p>${d.ninteyfifth}</p>
        `
    }

    tableData.appendChild(div);
  })
}


/*
------------------------
METHOD: add the button handler to the side panel button
------------------------
*/
function sidePanelButtonHandler(sidePanelButton, sidePanel) {
  let sidePanelHolder = document.getElementById(sidePanelButton);
  let datavizCopy = document.getElementById(sidePanel);
  let isVisible = false;

  sidePanelHolder.addEventListener("click", function() {
    if (isVisible) {
      datavizCopy.style.left = "0%";
      datavizCopy.style.opacity = 0;
      datavizCopy.style.pointerEvents = "none"; // disable pointer events
      isVisible = false;
      //change text of the button to "Show Data"
      sidePanelHolder.innerHTML = "Show Numerical Results";
      //change the x-axis opacity to 0
      d3.select("#xAxisDiv")
        .classed("hiddenXAxis", false)
    } else {
      datavizCopy.style.left = "0%";
      datavizCopy.style.opacity = 1;
      datavizCopy.style.pointerEvents = "auto"; // enable pointer events
      isVisible = true;
      sidePanelHolder.innerHTML = "Hide Numerical Results";
      d3.select("#xAxisDiv")
        .classed("hiddenXAxis", true)
    }
  });
}


// Exporting variables and functions
export { createCountryDivs, sidePanelButtonHandler };