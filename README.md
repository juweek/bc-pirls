# Project Organization

The project is the code used for the [2021 PIRLS interactive dashboards](https://html-css-js.jadesign.repl.co/indexSideNav.html). The code is organized into a bunch of html and js files stored at the root level. In addition, [helper functions](https://github.com/juweek/bc-pirls/tree/main/helperFunctions) and [csv data/images](https://github.com/juweek/bc-pirls/tree/main/data) are stored in subdirectories at the Root level.

There are four main groups of files: a pair of two files (one HTML, one JS). This corresponds to one pairing for Exhibit.

## Video Tutorials:
[Link 1](https://www.loom.com/share/7041f752ce5a450ba7bb4ae7facf2cfb?sid=a487827a-140f-4b0c-b015-629c7c246253)
[Link 2](https://www.loom.com/share/3ad829880b364b689a5730666b6f632f?sid=19bd37e4-6b2e-4d89-a6de-2ab4c21e9d83)


## Code Organization:

- **Exhibit 1.3:** 
This is a collection of overlapped rectangles, forming a test score distribution. The scores are divided by gender. The data can be found in [standardDeviation2.csv](https://github.com/juweek/bc-pirls/blob/main/data/standardDeviation2.csv), and the columns directly correlate to the beginning and end of the different distribution thresholds. Read more about the project if confused. 
  - [standardDeviation.html](https://github.com/juweek/bc-pirls/blob/main/standardDeviation.html)
  - [standardDeviationSideNav.html](https://github.com/juweek/bc-pirls/blob/main/standardDeviationSideNav.html)
  - [standardDeviation.js](https://github.com/juweek/bc-pirls/blob/main/sDeviation.js)
  - [Exhibit 1.3 ReadMe](https://github.com/juweek/bc-pirls/blob/main/documentation/exhibit1_3.md)

  ![](https://github.com/juweek/bc-pirls/blob/main/images/documentation_1_3.png)

***


- **Exhibit 4.2:** 
This is a collection of lollipop graphs. The data can be found in [percentages.csv](https://github.com/juweek/bc-pirls/blob/main/data/percentages.csv), and the columns directly correlate to the postion of the advanced, intermediate, high, and low test scores. 
  - [index.html](https://github.com/juweek/bc-pirls/blob/main/index.html)
  - [indexSideNav.html](https://github.com/juweek/bc-pirls/blob/main/indexSideNav.html)
  - [script.js](https://github.com/juweek/bc-pirls/blob/main/script.js)
  - [Exhibit 4.2 ReadMe](https://github.com/juweek/bc-pirls/blob/main/documentation/exhibit4_2.md)

![](https://github.com/juweek/bc-pirls/blob/main/images/documentation_4_2.png)

***


- **Exhibit 2.1/ 2.2:** 
This is a collection of line graphs, one for each country that shows the test scores since 2001. The data can be found in [averageAchievement.csv](https://github.com/juweek/bc-pirls/blob/main/data/averageAchievement.csv), and the columns directly correlate to the postion of the line graph at a certain year.
  - [lineGraph.html](https://github.com/juweek/bc-pirls/blob/main/lineGraph.html)
  - [lineGraphSideNav.html](https://github.com/juweek/bc-pirls/blob/main/lineGraphSideNav.html)
  - [lineGraph.js](https://github.com/juweek/bc-pirls/blob/main/lineGraph.js)

![](https://github.com/juweek/bc-pirls/blob/main/images/documentation_2_1.png)

***

- **Exhibit 2.3/ 2.4:** 
Similar to 2.1/2.2, this is a collection of line graphs, two for each country that shows the test scores since 2001. The scores are divided by gender. The data can be found in [gender.csv](https://github.com/juweek/bc-pirls/blob/main/data/gender.csv), and the columns directly correlate to the postion of the line graph at a certain year.
  - [genderGap.html](https://github.com/juweek/bc-pirls/blob/main/genderGap.html)
  - [genderGapSideNav.html](https://github.com/juweek/bc-pirls/blob/main/genderGapSideNav.html)
  - [genderGap.js](https://github.com/juweek/bc-pirls/blob/main/genderGap.js)

  ![](https://github.com/juweek/bc-pirls/blob/main/images/documentation_2_3.png)


## Shared Files:

In addition to the aforementioned files, each of the four main groups relies on:

- A shared set of CSS files:
  - [main.css](https://github.com/juweek/bc-pirls/blob/main/main.css)
  - [style.css](https://github.com/juweek/bc-pirls/blob/main/style.css)
  - and other specific files relating to the context

- Helper functions:
  - Found in the [helperFunctions](https://github.com/juweek/bc-pirls/tree/main/helperFunctions) subdirectory
  - sidePanel.js
  - tooltip.js
  - takeScreenshot.js
  - sortTrendPlots.js
  - sort.js

- A CSV file:
  - Linked in each pair’s JS file


## Basic Code Algorithm:

There are two main structures for the code; one is used for 1.3 and 4.2. The other is used for 2.1/2.2 and 2.3/2.4. 

Each javascript file (one for each of the four exhibits) go through a similar process: fetch the CSV data, format it for processing, then call the createChart() method (each file having their respective algorithms). Somewhere within the fetch call, handlers are attached to all search boxes and dropdowns, so the page becomes interactive and additional features are turned on.

Further information can be found in the respective Exhibit documents. 