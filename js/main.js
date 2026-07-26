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
