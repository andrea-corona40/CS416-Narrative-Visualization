let currentScene = 0;
let selectedCountry = "Mexico";
let countries = [];
let covidData = [];
let data = [];
let maxDate = new Date("2023-12-31");

const scenes = [
  {
    title: "Scene 1",
    text: "This is the first scene.",
    endDate: new Date("2020-10-31"),
  },
  {
    title: "Scene 2",
    text: "This is the second scene.",
    endDate: new Date("2021-10-31"),
  },
  {
    title: "Scene 3",
    text: "This is the third scene.",
    endDate: new Date("2022-10-31"),
  },
  {
    title: "Scene 4",
    text: "This is the fourth scene.",
    endDate: new Date("2023-10-31"),
  },
];

function updateStoryText() {
  const title = d3.select("#scene-title");
  const description = d3.select("#scene-description");

  title.classed("scene-animation", false);
  description.classed("scene-animation", false);

  title.node().offsetHeight;
  description.node().offsetHeight;

  title.text(scenes[currentScene].title).classed("scene-animation", true);
  description.text(scenes[currentScene].text).classed("scene-animation", true);
}

function updateIndicators() {
  d3.selectAll(".dot").classed("active", false);
  d3.selectAll(".dot")
    .filter((d, i) => i == currentScene)
    .classed("active", true);
}

function updateButtons() {
  d3.select("#previous").property("disabled", currentScene == 0);
  d3.select("#next").property("disabled", currentScene == scenes.length - 1);
}

function getCountryData(country) {
    return covidData.filter((d) => d.country === country).sort((a, b) => a.date - b.date);
}

function createCountryDropdown() {
  const dropdown = d3.select("#filter-country");

  const select = dropdown.append("select").attr("id", "country-select");

  select
    .selectAll("option")
    .data(countries)
    .enter()
    .append("option")
    .attr("value", (d) => d)
    .text((d) => d);

  select.property("value", selectedCountry);
    
  select.on("change", function () {
      selectedCountry = this.value;
      updateScene();
    });
}

function updateScene() {
  updateStoryText();
  updateIndicators();
  updateButtons();

  if (currentScene == scenes.length - 1) {
      d3.select("#filter-country").style("display", "flex");
      if (selectedCountry == "Mexico") {
          d3.select("#country-select").property("value", "Mexico");
      }
      
  } else {
    d3.select("#filter-country").style("display", "none");
    selectedCountry = "Mexico";
    
    }
    
   drawChart();
}

function getSceneData() {
    const data = getCountryData(selectedCountry);

    if (currentScene == scenes.length - 1) { return data }
    
    return data.filter((d) => d.date <= scenes[currentScene].endDate);
}


function drawAxis(data, width, height, margin) {
  const chart = d3.select("#chart").node();
  const svg = d3.select("#chart svg");
  svg.selectAll("*").remove();

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([0, width]);

  const yLeft = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => Math.max(d.cases, d.deaths))])
    .nice()
    .range([height, 0]);

  const yRight = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.vaccinations)])
    .nice()
    .range([height, 0]);

    g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
    
    g.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.top)
      .style("font-size", "12px")
      .text("Date");

    g.append("g").call(d3.axisLeft(yLeft));
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", - height/2 - margin.top)
      .attr("y", -45)
      .style("font-size", "12px")
      .text("Cases per Million");
    

    g.append("g")
      .attr("transform", `translate(${width}, 0)`)
       .call(d3.axisRight(yRight));
    
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2 - margin.top)
      .attr("y", width + 55)
      .style("font-size", "12px")
      .text("Vaccinations per Million");

  return { g, x, yLeft, yRight };
}

function drawLine(svg, g, data, field, color, legendText, legendX, legendY, yScale, x) {

    const line = d3
      .line()
      .defined((d) => d[field] !== null)
      .x((d) => x(d.date))
        .y((d) => yScale(d[field]));
    
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("d", line);
    
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendX}, ${legendY})`);
    
    legend
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 5)
      .attr("fill", color);

    legend
      .append("text")
      .text(legendText)
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle")
      .attr("transform", `translate(6, 1)`);
    
}

function drawChart() {
    const svg = d3.select("#chart svg");
    const data = getSceneData();
    const fullData = getCountryData(selectedCountry);

    const margin = {
      top: 30,
      right: 70,
      bottom: 50,
      left: 70,
    };

    const width = chart.offsetWidth - margin.left - margin.right;
    const height = chart.offsetHeight - margin.top - margin.bottom;
    

    const { g, x, yLeft, yRight } = drawAxis(fullData, width, height, margin);
    
    drawLine(svg, g, data, "cases",  "#003f5c", "New Cases per Million", (width / 2) - 50, 15, yLeft, x);

    drawLine(svg, g, data, "vaccinations", "#ff7f0e", "New Vaccinations per Million", (width / 2) + 90, 15, yRight, x);

}
async function init() {
  await d3.csv("data/data.csv").then(function (data) {
      covidData = data;
      console.log(covidData);
    countries = Array.from(new Set(covidData.map((d) => d.country))).sort(
      (a, b) => {
        if (a == "Mexico") return -1;
        if (b == "Mexico") return 1;
        return a.localeCompare(b);
      },
    );
  });
    const parseDate = d3.timeParse("%Y-%m-%d");

   covidData.forEach((d) => {
    d.date = parseDate(d.date);
    d.cases = parseInt(d.new_cases_smoothed_per_million) || 0;
    d.deaths = parseInt(d.new_deaths_smoothed_per_million) || 0;
    d.vaccinations = parseInt(d.new_vaccinations_smoothed_per_million) || 0;
   });
    
    covidData = covidData.filter((d) => d.date <= maxDate);

  createCountryDropdown();
  updateScene();
}

init();

d3.select("#next").on("click", function () {
  if (currentScene < scenes.length - 1) {
    currentScene++;
    updateScene();
  }
});

d3.select("#previous").on("click", function () {
  if (currentScene > 0) {
    currentScene--;
    updateScene();
  }
});

