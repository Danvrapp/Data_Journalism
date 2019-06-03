// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 560;

// Define the chart's margins as an object
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

// Define dimensions of the chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set the dimensions
var svg = d3
  .select(".content")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

// Append a group to the SVG area and shift ('translate') it to the right and down to adhere
// to the margins set in the "chartMargin" object.
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "age";
var chosenYAxis = "obese";

// function used for updating x-scale var upon click on axis label
function xScale(povertyData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(povertyData, d => d[chosenXAxis]) * 0.8,
      d3.max(povertyData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  return xLinearScale;
}

// function used for updating x-scale var upon click on axis label
function yScale(povertyData, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(povertyData, d => d[chosenYAxis]) * 0.8,
      d3.max(povertyData, d => d[chosenYAxis]) * 1.2
    ])
    .range([0, width]);
  return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));
    // .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "in_poverty") {
    var label = "In Poverty (%)";
  }
  else if (chosenXAxis=== "age") {
    var label = "Household Income (Median)";
  }
  else {
    var label = "Age (Median)";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([10, 10])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Load data from hours-of-tv-watched.csv
d3.csv("data.csv", function(error, povertyData) {

  // Log an error if one exists
  if (error) return console.warn(error);

  // Cast the hours value to a number for each piece of tvData
  povertyData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.incomeMoe = +data.incomeMoe;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
});

var xLinearScale = xScale(povertyData, chosenXAxis);

var yLinearScale = d3.scaleLinear()
  .domain([0, d3.max(povertyData, d =>d.obesity)])
  .range([height, 0]);

var bottomAxis = d3.axisBottom(xLinearScale);
var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

// append y axis
var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  .call(leftAxis);

// append initial circles
var circlesGroup = chartGroup.selectAll("circle")
    .data(povertyData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("r", 5)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  // Create group for  2 x- axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "in_poverty") // value to grab for event listener
    .classed("active", true)
    .text("% of residents in poverty");
  
    var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Median age");

    var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income");

  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

    // append y axis
  var obeseLabel = yLabelsGroup.append("text")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .classed("axis-text", true)
  .text("Obese (%)");

  var smokesLabel = yLabelsGroup.append("text")
  .attr("y", 0 - (margin.left - 20))
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .classed("axis-text", true)
  .text("Smokes (%)");

  var healthLabel = yLabelsGroup.append("text")
  .attr("y", 0 - (margin.left - 40))
  .attr("x", 0 - (height / 2))
  .attr("dy", "1em")
  .classed("axis-text", true)
  .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
  
        // replaces chosenXAxis with value
        chosenXAxis = value;
  
        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(povertyData, chosenXAxis);
  
        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);
  
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
  
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
        // changes classes to change bold text
        if (chosenXAxis === "in_poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else  {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    }); 

  yLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
  
        // replaces chosenXAxis with value
        chosenYAxis = value;
  
        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(povertyData, chosenYAxis);
  
        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);
  
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);
  
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenYAxis, circlesGroup);
  
        // changes classes to change bold text
        if (chosenYAxis === "obese") {
          obeseLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthLabel
          .classed("active", false)
          .classed("inactive", true);
        }
        else {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", true)
            .classed("inactive", false);
          healthLabel
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });
  });  
  