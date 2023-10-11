export class Tooltip {
  constructor(svg, height) {
    // Initialize vertical line
    this.verticalLine = svg.append('line')
      .attr('stroke', '#AA412F')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4')
      .style("pointer-events", "none")
      .style("opacity", 0);

    this.height = height;

    // Initialize tooltip
    this.tooltip = d3.select("#svganchor").select(".tooltip");
  }

  // Round year to the nearest available year
  roundToNearestYear(year) {
    const years = [2001, 2006, 2011, 2016, 2021];
    return years.reduce((prev, curr) => Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev);
  }

  // Set vertical line position
  setVerticalLinePosition(xPos) {
    this.verticalLine
      .attr('x1', xPos + 30)
      .attr('x2', xPos + 30)
      .attr('y1', 20)
      .attr('y2', this.height + 20)
      .style('opacity', 1);
  }

  // Display the tooltip
displayTooltip(content, x, y) {
  // Check if content contains the word 'girls' (case insensitive)
  const containsGirls = content.toLowerCase().includes('girls');

  // Adjust the top value based on the presence of the word 'girls'
  const topValue = containsGirls ? y + 150 : y + 450;  // Adjust the '400' to whatever value you need

  this.tooltip.html(content)
    .style("left", `${x + 10}px`)
    .style("top", `${topValue}px`)
    .style("opacity", 1);
}

  hideTooltip() {
    this.tooltip.style("opacity", 0);
  }

  hideVerticalLine() {
    this.verticalLine.style('opacity', 0);
  }

  // Get tooltip content
  generateTooltipContent(element, year) {
    const country = d3.select(element).attr('data-Country');
    const yearsWithData = [2001, 2006, 2011, 2016, 2021];
    let content = `<b style="font-family: 'PT Sans', sans-serif; font-size: 14px;">${country}</b><br>`;
    //give content the font-family of PT Sans

    yearsWithData.forEach(y => {
      const dataForYear = d3.select(element).attr(`data-${y}`);
      const errorForYear = d3.select(element).attr(`data-${y}_se`);
      const yearHighlight = y == year ? "<b>" : "";
      const yearEndHighlight = y == year ? "</b>" : "";

      const displayData = (dataForYear == 0 || dataForYear == null)
        ? `PIRLS ${y}: --`
        : `PIRLS ${y}: ${dataForYear} (${errorForYear})`;

      content += `${yearHighlight}${displayData}${yearEndHighlight}<br>`;
    });

    return content;
  }

  generateTooltipContentGender(element, year) {
  const country = d3.select(element).attr('data-Country');
  const yearsWithData = [2001, 2006, 2011, 2016, 2021];
  let content = `<b style="font-family: 'PT Sans', sans-serif; font-size: 14px;">${country}</b><div class="gender-tooltip-content">`;

  yearsWithData.forEach(y => {
    const dataForBoy = d3.select(element).attr(`data-${y}`);
    const dataForGirl = d3.select(element).attr(`data-${y}g`);
    const yearHighlight = y == year ? "<b>" : "";
    const yearEndHighlight = y == year ? "</b>" : "";

    const displayDataBoy = (dataForBoy == 0 || dataForBoy == null) 
      ? `(Boys): --`
      : `(Boys): ${dataForBoy}`;

    const displayDataGirl = (dataForGirl == 0 || dataForGirl == null) 
      ? `(Girls): --`
      : `(Girls): ${dataForGirl}`;

    // Each year is a row, with two columns for boys and girls
    content += `
      <div class="gender-tooltip-row">
       <div class="gender-tooltip-column">${yearHighlight}PIRLS ${y}${yearEndHighlight}</div>
        <div class="gender-tooltip-column">${yearHighlight}${displayDataBoy}${yearEndHighlight}</div>
        <div class="gender-tooltip-column">${yearHighlight}${displayDataGirl}${yearEndHighlight}</div>
      </div>`;
  });

  content += `</div>`;  // Close the gender-tooltip-content
  return content;
}

}
