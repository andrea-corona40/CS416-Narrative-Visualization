let currentScene = 0;
let selectedCountry = "Mexico";
let countries = [];

const scenes = [
  {
    title: "Scene 1",
    text: "This is the first scene.",
  },
  {
    title: "Scene 2",
    text: "This is the second scene.",
  },
  {
    title: "Scene 3",
    text: "This is the third scene.",
  },
  {
    title: "Scene 4",
    text: "This is the fourth scene.",
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
  } else {
    d3.select("#filter-country").style("display", "none");
    selectedCountry = "Mexico";
  }
}

d3.csv("data/data.csv").then(function (data) {
    covidData = data;
    countries = Array.from(
        new Set(covidData.map(d => d.country))
    ).sort((a, b) => {
        if (a == "Mexico") return -1;
        if (b == "Mexico") return 1;
        return a.localeCompare(b);
    });

    createCountryDropdown();
    updateScene();
});

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


const chart = d3.select("#chart");
const svg = d3.select("#chart svg");

const margin = {
    top: 30,
    right: 70,
    bottom: 50,
    left: 70
};

const width = chart.width - margin.left - margin.right;
const height = chart.height - margin.top - margin.bottom;

const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

const parseDate = d3.timeParse("%Y-%m-%d");

covidData.forEach(d => {
  d.date = parseDate(d.date);
  d.cases = d.new_cases_smoothed_per_million;
  d.deaths = d.new_deaths_smoothed_per_million;
  d.vaccinations = d.new_vaccinations_smoothed_per_million;

})

const x = d3.scaleTime().domain(d3.extent(covidData, d => d.date)).range([0, width]);

const yLeft = d3.scaleLinear().domain([0, d3.max(covidData, d=> Math.max(d.cases, d.vaccinations))]).nice().range([0, height]);

const yRight = d3.scaleLinear().domain([0, d3.max(covidData, d=> d.deaths)]).nice().range([0, height]);

g.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x));

g.append("g").call(d3.axisLeft(yLeft));

g.append("g").attr("transform", `translate(${width}, 0)`).call(d3.axisRigth(yRight));