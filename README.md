# Project Organization

The project is organized into a bunch of html and js files stored at the root level. In addition, helper functions and csv data are stored in subdirectories at the Root level.

There are four main groups of files: a pair of two files (one HTML, one JS). This corresponds to one pairing for Exhibit.

## Code Organization:

- **Exhibit 1.3:** 
  - **index.html**
  - **indexSideNav.html**
  - **script.js**

- **Exhibit 2.1/ 2.2:** 
  - **lineGraph.html**
  - **lineGraphSideNav.html**
  - **lineGraph.js**

- **Exhibit 2.3/ 2.4:** 
  - **genderGap.html**
  - **genderGapSideNav.html**
  - **genderGap.js**	

- **Exhibit 4.2:** 
  - **standardDeviation.html**
  - **standardDeviation.html**
  - **standardDeviation.js**

## Shared Files:

In addition to the aforementioned files, each of the four main groups relies on:

- A shared set of CSS files:
  - **main.css**
  - **nav.css**
  - ... (add other files as needed)

- Helper functions:
  - Found in the **helperFunctions** subdirectory
  - sidePanel.js
  - tooltip.js
  - takeScreenshot.js
  - sortTrendPlots.js
  - sort.js

- A CSV file:
  - Linked in each pair’s JS file.

## Basic Code Algorithm:

There are two main structures for the code; one is used for 1.3 and 4.2. The other is used for 2.1/2.2 and 2.3/2.4. 

Each javascript file (one for each of the four exhibits) go through a similar process: fetch the CSV data, format it for processing, then call the createChart() method (each file having their respective algorithms). Somewhere within the fetch call, handlers are attached to all search boxes and dropdowns, so the page becomes interactive and additional features are turned on.

Further information can be found in the respective Exhibit documents. 