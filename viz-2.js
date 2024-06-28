let active = false;
let currentMode = "Female";
const margin = { top: 0.05 * window.innerHeight, right: 0.065 * window.innerWidth, bottom: 0.07 * window.innerHeight, left: 0.13 * window.innerWidth },
  width = window.innerWidth * 0.85 - margin.left - margin.right,
  height = window.innerHeight * 0.85 - margin.top - margin.bottom;

const svg = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

function toggle() {
  let toggle = document.querySelector(".toggle");
  let text = document.querySelector(".text");
  currentMode = currentMode === "Male" ? "Female" : "Male"; // Toggle currentMode
  if (currentMode === "Female") {
    toggle.classList.add("active");
    text.innerHTML = "Female";
  } else {
    toggle.classList.remove("active");
    text.innerHTML = "Male";
  }

  svg.selectAll("*").remove();
  d3.select("#legend").selectAll("*").remove();
  d3.select(".tooltip").selectAll("*").remove();

  d3.csv("viz-2.csv").then(function (data) {
    // Convert string data to numeric
    data.forEach(function (d) {
      d["Year"] = +d["Year"];
      d["Daily caloric intake per person from fat"] = +d["Daily caloric intake per person from fat"];
      d["Daily caloric intake per person from carbohydrates"] = +d["Daily caloric intake per person from carbohydrates"];
      d["Mean BMI (male)"] = +d["Mean BMI (male)"];
      d["Mean BMI (female)"] = +d["Mean BMI (female)"];
    });

    // Filter data for year 2016
    data = data.filter(function (d) {
      return d["Year"] === 2016;
    });

    const bmiColumn = currentMode === "Male" ? "Mean BMI (male)" : "Mean BMI (female)";
    console.log(bmiColumn);
    if (bmiColumn == "Mean BMI (male)") {
      colorScale = d3
        .scaleSequential()
        .interpolator(d3.interpolateBlues)
        .domain(d3.extent(data, (d) => d[bmiColumn]));
    } else {
      colorScale = d3
        .scaleSequential()
        .interpolator(d3.interpolateRdPu)
        .domain(d3.extent(data, (d) => d[bmiColumn]));
    }
    // Add X axis
    const x = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, function (d) {
          return d["Daily caloric intake per person from carbohydrates"];
        }),
      ])
      .range([0, width]);
    svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x));

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width - width / 5)
      .attr("y", height + margin.top)
      .style("font-size", "20px") // Set font size
      .text("Daily caloric intake per person from carbohydrates");
    svg.selectAll(".tick text").style("font-size", "10px");
    // Add Y axis
    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, function (d) {
          return d["Daily caloric intake per person from fat"];
        }),
      ])
      .range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + margin.left / 1.5)
      .attr("x", -4 * margin.top)
      .attr("dy", "1em") // Adjust vertical position
      .style("font-size", "20px") // Set font size
      .text("Daily caloric intake per person from fat");
    svg.selectAll(".tick text").style("font-size", "10px");
    // Add dots
    // Add dots with color based on Mean BMI (male)
    svg
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function (d) {
        return x(d["Daily caloric intake per person from carbohydrates"]);
      })
      .attr("cy", function (d) {
        return y(d["Daily caloric intake per person from fat"]);
      })
      .attr("r", 9)
      .style("fill", (d) => colorScale(d[bmiColumn])) // Fill color based on Mean BMI (male)
      .style("opacity", 0.7)
      .style("stroke", "white")
      .on("mouseover", function (event, d) {
        tooltip
          .style("opacity", 1)
          .html(`Country: ${d.Entity}<br>Carbohydrates: ${d["Daily caloric intake per person from carbohydrates"]}<br>Fat: ${d["Daily caloric intake per person from fat"]}<br>Mean BMI(Male):${d[bmiColumn]}`)
          .style("left", event.pageX + "px")
          .style("top", event.pageY - height / 2 + "px");
      })
      .on("mouseleave", function (d) {
        tooltip.style("opacity", 0);
      });
    // Define the width and height of the legend
    const legendWidth = 400;
    const legendHeight = 200;
    const legendMargin = { top: 10, right: 10, bottom: 10, left: 10 };
    const legendContainer = d3.select("#legend").append("svg").attr("width", legendWidth).attr("height", legendHeight).append("g").attr("transform", `translate(${legendMargin.left}, ${legendMargin.top})`);

    // Add legend scale
    const legendScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => d[bmiColumn]))
      .range([0, legendWidth - legendMargin.left - legendMargin.right]);

    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(6) // Adjust the number of ticks as needed
      .tickFormat(d3.format(".1f"));

    legendContainer
      .append("g")
      .attr("class", "legend-axis")
      .attr("transform", `translate(0, ${legendHeight - legendMargin.bottom})`)
      .call(legendAxis)
      .selectAll("text")
      .style("font-size", "10x");

    // Add color gradient to the legend
    const defs = legendContainer.append("defs");

    const linearGradient = defs.append("linearGradient").attr("id", "gradient").attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");

    linearGradient
      .selectAll("stop")
      .data(colorScale.range())
      .enter()
      .append("stop")
      .attr("offset", (d, i) => i / (colorScale.range().length - 1))
      .attr("stop-color", (d) => d);

    legendContainer.append("rect").attr("width", 500).attr("height", 20).style("fill", "url(#gradient)").style("padding", "15px");

    // Add legend label
    legendContainer
      .append("text")
      .attr("x", 0)
      .attr("y", legendMargin.top + 30)
      .attr("fill", "#000")
      .style("font-size", "25px")
      .text("Mean BMI (" + currentMode + ")");
    var legend = d3.legendColor().scale(colorScale).cells(5);
    // Add a tooltip div
    const tooltip = d3.select(".chart-container-2").append("div").attr("class", "tooltip").style("opacity", 0).style("background-color", "white").style("border", "solid").style("border-width", "1px").style("border-radius", "5px").style("padding", "10px").style("font-size", "15px"); // Set font size

    // Mouseover event handler for the circles
    svg
      .selectAll("circle")
      .on("mouseover", function (event, d) {
        const tooltipWidth = parseFloat(tooltip.style("width").split("px")[0]);
        const tooltipHeight = parseFloat(tooltip.style("height").split("px")[0]);
        console.log(event.pageX - tooltipWidth / 2, event.pageY - tooltipHeight - 20);
        tooltip
          .style("opacity", 1)
          .html(
            `Country: ${d.Entity}<br>
        Carbohydrates: ${d["Daily caloric intake per person from carbohydrates"]}<br>
        Fat: ${d["Daily caloric intake per person from fat"]}<br>
        Mean BMI(Male): ${d["Mean BMI (male)"]}`
          )
          .style("left", event.pageX - tooltipWidth / 2 + "px") // Position tooltip at the center of mouse
          .style("top", event.pageY - height / 1.6 + "px"); // Position above the mouse
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0); // Hide tooltip on mouseout
      });
    // Append legend to the legend container
    legendContainer.append("g").attr("class", "legend").attr("transform", "translate(0, 50)").call(legend);
  });
}

//Read the data
d3.csv("combined_data.csv").then(function (data) {
  // Convert string data to numeric
  data.forEach(function (d) {
    d["Year"] = +d["Year"];
    d["Daily caloric intake per person from fat"] = +d["Daily caloric intake per person from fat"];
    d["Daily caloric intake per person from carbohydrates"] = +d["Daily caloric intake per person from carbohydrates"];
    d["Mean BMI (male)"] = +d["Mean BMI (male)"];
    d["Mean BMI (female)"] = +d["Mean BMI (female)"];
  });

  // Filter data for year 2016
  data = data.filter(function (d) {
    return d["Year"] === 2016;
  });
  const colorScale = d3
    .scaleSequential()
    .interpolator(d3.interpolateBlues)
    .domain(d3.extent(data, (d) => d["Mean BMI (male)"]));
  // Add X axis
  const x = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function (d) {
        return d["Daily caloric intake per person from carbohydrates"];
      }),
    ])
    .range([0, width]);
  svg.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x));

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("x", width - width / 5)
    .attr("y", height + margin.top)
    .style("font-size", "20px") // Set font size
    .text("Daily caloric intake per person from carbohydrates");
  svg.selectAll(".tick text").style("font-size", "10px");
  // Add Y axis
  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, function (d) {
        return d["Daily caloric intake per person from fat"];
      }),
    ])
    .range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  svg
    .append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + margin.left / 1.5)
    .attr("x", -4 * margin.top)
    .attr("dy", "1em") // Adjust vertical position
    .style("font-size", "20px") // Set font size
    .text("Daily caloric intake per person from fat");
  svg.selectAll(".tick text").style("font-size", "10px");
  // Add dots
  // Add dots with color based on Mean BMI (male)
  svg
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return x(d["Daily caloric intake per person from carbohydrates"]);
    })
    .attr("cy", function (d) {
      return y(d["Daily caloric intake per person from fat"]);
    })
    .attr("r", 9)
    .style("fill", (d) => colorScale(d["Mean BMI (male)"])) // Fill color based on Mean BMI (male)
    .style("opacity", 0.7)
    .style("stroke", "white")
    .on("mouseover", function (event, d) {
      tooltip
        .style("opacity", 1)
        .html(`Country: ${d.Entity}<br>Carbohydrates: ${d["Daily caloric intake per person from carbohydrates"]}<br>Fat: ${d["Daily caloric intake per person from fat"]}<br>Mean BMI(Male):${d["Mean BMI (male)"]}`)
        .style("left", event.pageX + "px")
        .style("top", event.pageY - 28 + "px");
    })
    .on("mouseleave", function (d) {
      tooltip.style("opacity", 0);
    });
  // Define the width and height of the legend
  const legendWidth = 400;
  const legendHeight = 200;
  const legendMargin = { top: 10, right: 10, bottom: 10, left: 10 };
  const legendContainer = d3.select("#legend").append("svg").attr("width", legendWidth).attr("height", legendHeight).append("g").attr("transform", `translate(${legendMargin.left}, ${legendMargin.top})`);

  // Add legend scale
  const legendScale = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d["Mean BMI (male)"]))
    .range([0, legendWidth - legendMargin.left - legendMargin.right]);

  const legendAxis = d3
    .axisBottom(legendScale)
    .ticks(6) // Adjust the number of ticks as needed
    .tickFormat(d3.format(".1f"));

  legendContainer
    .append("g")
    .attr("class", "legend-axis")
    .attr("transform", `translate(0, ${legendHeight - legendMargin.bottom})`)
    .call(legendAxis)
    .selectAll("text")
    .style("font-size", "10x");

  // Add color gradient to the legend
  const defs = legendContainer.append("defs");

  const linearGradient = defs.append("linearGradient").attr("id", "gradient").attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%");

  linearGradient
    .selectAll("stop")
    .data(colorScale.range())
    .enter()
    .append("stop")
    .attr("offset", (d, i) => i / (colorScale.range().length - 1))
    .attr("stop-color", (d) => d);

  legendContainer.append("rect").attr("width", 500).attr("height", 20).style("fill", "url(#gradient)").style("padding", "15px");

  // Add legend label
  legendContainer
    .append("text")
    .attr("x", 0)
    .attr("y", legendMargin.top + 30)
    .attr("fill", "#000")
    .style("font-size", "25px")
    .text("Mean BMI (male)");
  var legend = d3.legendColor().scale(colorScale).cells(5);
  // Add a tooltip div
  const tooltip = d3.select("#tooltip").style("opacity", 0).style("background-color", "white").style("border", "solid").style("border-width", "1px").style("border-radius", "5px").style("padding", "10px").style("font-size", "15px"); // Set font size

  // Mouseover event handler for the circles
  svg
    .selectAll("circle")
    .on("mouseover", function (event, d) {
      const tooltipWidth = parseFloat(tooltip.style("width").split("px")[0]);
      const tooltipHeight = parseFloat(tooltip.style("height").split("px")[0]);
      tooltip
        .style("opacity", 1)
        .html(
          `Country: ${d.Entity}<br>
        Carbohydrates: ${d["Daily caloric intake per person from carbohydrates"]}<br>
        Fat: ${d["Daily caloric intake per person from fat"]}<br>
        Mean BMI(Male): ${d["Mean BMI (male)"]}`
        )
        .style("left", event.pageX - 1000 - tooltipWidth / 2 + "px") // Position tooltip at the center of mouse
        .style("top", event.pageY - tooltipHeight - 20 + "px"); // Position above the mouse
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0); // Hide tooltip on mouseout
    });
  // Append legend to the legend container
  legendContainer.append("g").attr("class", "legend").attr("transform", "translate(0, 50)").call(legend);
});

toggle();
