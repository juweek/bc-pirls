# Code Organization: Exhibit 1.3

The project is organized into four main groups of files:
- **Exhibit 1.3:** 
  - **index.html**
  - **indexSideNav.html**
  - **script.js**

In addition, this specific file will rely on:
- A shared set of CSS files:
  - **main.css**
  - **nav.css**
  - ... (add other files as needed)
- Helper functions:
  - Found in the **helperFunctions** subdirectory
- A CSV file:
  - Linked in each pair’s JS file

---

## Importing the Necessary Modules (Lines: 1-4)

Modules are imported from three separate utility files: **sidePanel.js**, **searchFilter.js**, and **takeScreenshot.js**. These files contain functions that respectively manage side panel interactions, filter search results, and capture screenshots. The **sort.js** file provides data sorting functionalities.

---

## Deciding the Graph Dimensions (Lines: 14-17)

Here we define a margin object to specify the spacing around our main chart area. The width and height variables then set the dimensions of the main visualization area by subtracting these margins.

---

## Initialization the SVG and other variables (Lines: 20-27)

We initialize the main visualization canvas by selecting the HTML element with the ID **my_dataviz**. An SVG element, which will contain our chart, is then appended to this. The dimensions of this SVG are set based on the previously defined width and height.

---

## Adding the dropdown handlers; Browser Detection (Lines: 30-37)

The **sortDropdown** and **orderDropdown** variables select the dropdown elements responsible for sorting the data in various ways. Additionally, we check the user's browser's User Agent to detect if they're using a Windows OS. If they are, a specific CSS class is added for styling purposes.

---

## Main Chart Creation - createChart Function (Lines: 40-265)

This function serves as the backbone of our tool. With the provided data, it:
- Fetches the data from the linked csv file.
- Adjusts the SVG size based on the data length.
- Constructs the x and y axes.
- Renders the data points as lines and circles.
- Introduces interactivity by showing tooltips when the user hovers over data points.
- Dynamically colors and styles elements based on specific conditions, such as the country's Wave value.

---

## Synchronized the Table and Graphs (Lines: 268-277)

For a seamless user experience, two DOM elements (**my_dataviz** and **datavizCopy**) are synchronized in their vertical scroll. This is the table and the graphic. This ensures that when one element scrolls, the other follows suit.

---

## Side Panel Toggle (Line: 280)

We use the **sidePanelButtonHandler** function, imported from **sidePanel.js**, to manage the toggling behavior of the **datavizCopy** side panel. Activating the associated button will toggle the side panel's visibility.

---

## Create the SVG to PNG Download (Lines: 283-287)

A button with the ID **downloadButton1** is set up to capture the current state of the SVG visualization and download it as a JPEG. The capturing and conversion process is handled by the **svgToJpegDownload** function from the **takeScreenshot.js** module.

---

## Handle the Processing for Searching and Filtering (Lines: 290-518)

The tool fetches data from an online CSV source. Once the data is loaded:
- Dropdowns (from **sort.js**) allow users to sort the displayed data.
- Checkboxes filter displayed data based on the Wave attribute.
- An input search bar (from **searchFilter.js**) helps users select specific countries. The results are then dynamically highlighted and the chart is redrawn accordingly.

---

## Responsive Design (Lines: 521-536)

For a dynamic display on different devices, the **reportWindowSize** function recalculates and adjusts the SVG dimensions depending on the window's width. This function is triggered during window resize events to ensure the visualization remains optimal.

---

This README provides a structured and detailed overview, designed to make it easier for developers or engineers to delve deeper into specific functionalities and expand on the existing framework.
