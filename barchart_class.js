// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
// import _ from "https://cdn.jsdelivr.net/npm/lodash@4.17.21/+esm";

// async function drawVis() {
//   const dataset = await d3.csv("./datasets/videogames_wide.csv", d3.autoType);
//   console.log(dataset);
//   // Global_Sales, JP_Sales

//   const width = 640;
//   const height = 400;

//   const margin = { top: 10, right: 20, bottom: 20, left: 50 };

//   const svg = d3
//     .select("#visContainer")
//     .append("svg")
//     .attr("width", width)
//     .attr("height", height)
//     .style("border", "1px solid black");

//   // group dataset by Immigration program and sum Invitations issued
//   const df = _(dataset)
//     .groupBy("Genre")
//     .map((objs, key) => ({
//       Genre: key,
//       Global_Sales: _.sumBy(objs, "Global_Sales"),
//     }))
//     .value();
//   console.log(df);

// //   // add x axis
//   const SalesExtent = d3.extent(df, (d) => d["Global_Sales"]);
//   const Genres = df.map((d) => d["Genre"]);

//   const xScale = d3
//     .scaleBand()
//     .domain(Genres)
//     .range([margin.left, width - margin.right])
//     .padding(0.1);
//   const yScale = d3
//     .scaleLinear()
//     .domain(SalesExtent)
//     .range([height - margin.bottom, margin.top]);

// //generates bars

//   svg
//     .selectAll("rect")
//     .data(df)
//     .join("rect")
//     .attr("x", (d) => {
//       return xScale(d["Genre"]);
//     })
//     .attr("y", (d) => {
//       return yScale(d["Global_Sales"]);
//     })
//     .attr("width", xScale.bandwidth())
//     .attr("height", (d) => {
//       return height - margin.bottom - yScale(d["Global_Sales"]);
//     });

  
// //creates text for x & y axis
//   svg
//     .append("g")
//     .call(d3.axisBottom(xScale))
//     .attr("transform", `translate(0, ${height - margin.bottom})`);

//   svg
//     .append("g")
//     .call(d3.axisLeft(yScale))
//     .attr("transform", `translate(${margin.left}, 0)`);


// }
// drawVis();

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import _ from "https://cdn.jsdelivr.net/npm/lodash@4.17.21/+esm";

async function drawVis() {
  const dataset = await d3.csv("./datasets/videogames_wide.csv", d3.autoType);
  console.log(dataset);

  const width = 640;
  const height = 400;

  const margin = { top: 10, right: 20, bottom: 20, left: 50 };

  const svg = d3
    .select("#visContainer")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("border", "1px solid black");

  // Group dataset by Genre and sum Global Sales
  const originalDf = _(dataset)
    .groupBy("Genre")
    .map((objs, key) => ({
      Genre: key,
      Global_Sales: _.sumBy(objs, "Global_Sales"),
    }))
    .value();

  // Copy the original data for sorting and resetting
  let df = [...originalDf];
  let switched = false;  // State for tracking axis switch

  const xScale = d3
    .scaleBand()
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .range([height - margin.bottom, margin.top]);

  const xScaleSwitched = d3
    .scaleLinear()
    .range([margin.left, width - margin.right]);

  const yScaleSwitched = d3
    .scaleBand()
    .range([height - margin.bottom, margin.top])
    .padding(0.1);

  function updateChart() {
    const SalesExtent = d3.extent(df, (d) => d["Global_Sales"]);
    const Genres = df.map((d) => d["Genre"]);

    if (!switched) {
      xScale.domain(Genres);
      yScale.domain(SalesExtent);

      svg.selectAll("rect").remove();
      svg.selectAll("rect")
        .data(df)
        .join("rect")
        .attr("x", (d) => xScale(d["Genre"]))
        .attr("y", (d) => yScale(d["Global_Sales"]))
        
        .attr("width", xScale.bandwidth())
        .attr("height", (d) => height - margin.bottom - yScale(d["Global_Sales"]))
        // .attr("fill", blue);

      svg.selectAll("g.axis").remove();
      svg.append("g")
        .attr("class", "axis x-axis")
        .call(d3.axisBottom(xScale))
        .attr("transform", `translate(0, ${height - margin.bottom})`);

      svg.append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(yScale))
        .attr("transform", `translate(${margin.left}, 0)`);
    } else {
      xScaleSwitched.domain(SalesExtent);
      yScaleSwitched.domain(Genres);

      svg.selectAll("rect").remove();
      svg.selectAll("rect")
        .data(df)
        .join("rect")
        .attr("x", (d) => margin.left)
        .attr("y", (d) => yScaleSwitched(d["Genre"]))
        .attr("width", (d) => xScaleSwitched(d["Global_Sales"]))
        .attr("height", yScaleSwitched.bandwidth());

      svg.selectAll("g.axis").remove();
      svg.append("g")
        .attr("class", "axis x-axis")
        .call(d3.axisBottom(xScaleSwitched))
        .attr("transform", `translate(0, ${height - margin.bottom})`);

      svg.append("g")
        .attr("class", "axis y-axis")
        .call(d3.axisLeft(yScaleSwitched))
        .attr("transform", `translate(${margin.left}, 0)`);
    }
  }

  updateChart();

  // Add sort button functionality
  d3.select("#sortButton").on("click", () => {
    df = _.sortBy(df, (d) => -d["Global_Sales"]);
    updateChart();
  });

  // Add reset button functionality
  d3.select("#resetButton").on("click", () => {
    df = [...originalDf];
    updateChart();
  });

  // Add switch axes button functionality
  d3.select("#switchAxesButton").on("click", () => {
    switched = !switched;
    updateChart(); // Update chart with switched axes
  });
}

drawVis();
