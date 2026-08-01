let currentScene = 0;
let selectedCountry = "Mexico";
let countries = [];
let covidData = [];
let data = [];
let maxDate = new Date("2023-12-31");
let animateChart = true;
let displayFilter = false;
let displayTooltips = false;
let displayYear = "2020";

const scenes = [
  {
    title: "Scene 1",
    text: "Mexico confirma primeros casos del país el 28 de febrero",
    year: "2020",
    annotations: [
      {
        date: new Date("2020-07-15"),
        text: "Primera ola alcanza su primer pico",
        posX: 0,
        posY: 200,
        rectHeight: 75,
        rectWidth: 100,
      },

      {
        date: new Date("2020-12-24"),
        text: "Inicio de la vacunación en México",
        posX: 0,
        posY: 200,
        rectHeight: 75,
        rectWidth: 100,
      },
    ],
  },
  {
    title: "Scene 2",
    text: "This is the second scene.",
    year: "2021",
    annotations: [
      {
        date: new Date("2021-01-15"),
        text: "Segunda Ola de COVID",
        posX: 0,
        posY: 250,
        rectHeight: 50,
        rectWidth: 100,
      },
      {
        date: new Date("2021-02-21"),
        text: "Comienza vacunación masiva en adultos mayores",
        posX: 50,
        posY: 100,
        rectHeight: 100,
        rectWidth: 90,
      },
      {
        date: new Date("2021-08-15"),
        text: "Tercera ola impulsada por la variante Delta",
        posX: 0,
        posY: 200,
        rectHeight: 90,
        rectWidth: 100,
      },
    ],
  },
  {
    title: "Scene 3",
    text: "This is the third scene.",
    year: "2022",
    annotations: [
      {
        date: new Date("2022-01-21"),
        text: "Cuarta ola asociada a omnicron",
        posX: -100,
        posY: 0,
        rectHeight: 70,
        rectWidth: 100,
      },

      {
        date: new Date("2022-04-15"),
        text: "Over 200M de dosis aplicadas",
        posX: 0,
        posY: 200,
        rectHeight: 70,
        rectWidth: 90,
      },

      {
        date: new Date("2022-07-15"),
        text: "Quinta ola con variantes de Omicron",
        posX: 0,
        posY: 150,
        rectHeight: 70,
        rectWidth: 100,
      },
    ],
  },
  {
    title: "Scene 4",
    text: "This is the fourth scene.",
    year: "2021",
    annotations: [
      {
        date: new Date("2023-01-15"),
        text: "Sexta ola de COVID",
        posX: 0,
        posY: 200,
        rectHeight: 50,
        rectWidth: 75,
      },

      {
        date: new Date("2023-05-09"),
        text: "Fin de la emergencia sanitaria por COVID-19",
        posX: 0,
        posY: 150,
        rectHeight: 90,
        rectWidth: 100,
      },
    ],
  },

  {
    title: "Scene 5",
    text: "This is the fifth scene.",
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
      animateChart = false;
      updateScene();
    });
}

function updateScene() {
  updateStoryText();
  updateIndicators();
  updateButtons();

  if (currentScene == scenes.length - 1) {
      displayFilter = true;
      displayTooltips = true;
      if (selectedCountry == "Mexico") {
          d3.select("#country-select").property("value", "Mexico");
      }
      
  } else {
    displayFilter = false;
    displayTooltips = false;
    selectedCountry = "Mexico";
    animateChart = true;
    
 }
  if (displayFilter){
  d3.select("#filter-country").style("display", "flex");
  } else
  {
  d3.select("#filter-country").style("display", "none");
  }

  year = scenes[currentScene].year;
    
   drawChart();
}

function getSceneData() {
    const data = getCountryData(selectedCountry);
    
    return data.filter((d) => d.date <= new Date(`${displayYear}-12-31`));
}


function drawAxis(data, width, height, margin) {
  const chart = d3.select("#chart").node();
  const svg = d3.select("#chart svg");

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.date))
    .range([0, width]);

    const yLeft = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.cases)])
      .nice()
      .range([height, 0]);

  /*const yRight = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.vaccinations)])
    .nice()
    .range([height, 0]);*/

  g.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  g.append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.top)
    .style("font-size", "12px")
    .text("Date");

  g.append("g").call(d3.axisLeft(yLeft));

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2 - margin.top)
    .attr("y", -45)
    .style("font-size", "12px")
    .text("Cases per Million");

  /*
    g.append("g")
      .attr("transform", `translate(${width}, 0)`)
       .call(d3.axisRight(yRight));
    
    
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2 - margin.top)
      .attr("y", width + 55)
      .style("font-size", "12px")
      .text("Vaccinations per Million");*/

  return { g, x, yLeft }; //yRight
}

function drawLine(svg, g, data, field, color, legendText, legendX, legendY, yScale, x) {

    const line = d3
      .line()
      .defined((d) => d[field] !== null)
      .x((d) => x(d.date))
        .y((d) => yScale(d[field]));

    const path = g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("clip-path", "url(#chartClip)")
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
//yRight
function addSceneAnnotation(g, data, annotation, x, yLeft, width, height) {
  if (currentScene == scenes.length - 1) return;

  const annotationDate = annotation.date;

  const bisectDate = d3.bisector((d) => d.date).left;

  const index = bisectDate(data, annotationDate);

  const d = data[index];

  if (!d) return;

  const xPos = x(d.date);
  const casesY = yLeft(d.cases);
  //const deathsY = yLeft(d.deaths);
  //const vaccinationY = yRight(d.vaccinations);

  const g_annotation = g.append("g").attr("class", "annotation");

  g_annotation
    .append("circle")
    .attr("cx", xPos)
    .attr("cy", casesY)
    .attr("r", 5)
    .attr("fill", "#003f5c");

  /*
    g_annotation
      .append("circle")
      .attr("cx", xPos)
      .attr("cy", deathsY)
      .attr("r", 5)
        .attr("fill", "#8B0000");
    g_annotation
        .append("circle")
        .attr("cx", xPos)
        .attr("cy", vaccinationY)
        .attr("r", 5)
        .attr("fill", "#ff7f0e");*/

  const posX = xPos + annotation.posX;
  const posY = casesY - annotation.posY;
  const rectWidth = annotation.rectWidth;
  const rectHeight = annotation.rectHeight;

  g_annotation
    .append("line")
    .attr("x1", xPos)
    .attr("y1", casesY)
    .attr("x2", posX)
    .attr("y2", posY)
    .attr("stroke", "black");
  
  const relposX = posX - rectWidth / 2;

  g_annotation
    .append("rect")
    .attr("class", "annotation-box")
    .attr("x", relposX)
    .attr("y", posY - 20)
    .attr("width", rectWidth)
    .attr("height", rectHeight);

  g_annotation
    .append("polygon")
    .attr("class", "annotation-bookmark")
    .attr(
      "points",
      `
        ${relposX + rectWidth - 25},${posY - 20}
        ${relposX + rectWidth},${posY - 20}
        ${relposX + rectWidth},${posY - 20 + 25}
    `,
    );

  /*
  g_annotation
    .append("text")
    .attr("class", "annotation-text")
    .attr("x", relposX + 10)
    .attr("y", posY - 20 + rectHeight / 2)
    .style("font-size", "12px")
    .text(annotation.text);*/
  
  g_annotation
    .append("foreignObject")
    .attr("x", relposX + 10)
    .attr("y", posY - 20 + 10)
    .attr("width", rectWidth - 20)
    .attr("height", rectHeight - 20)
    .append("xhtml:div")
    .style("font-size", "12px")
    .style("line-height", "15px")
    .style("word-wrap", "break-word")
    .style("overflow-wrap", "break-word")
    .style("text-align", "center")
    .text(annotation.text);
}

function drawChart() {
  const svg = d3.select("#chart svg");

  svg.selectAll("*").remove();

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

  const { g, x, yLeft } = drawAxis(fullData, width, height, margin); // yRight

  const clip = g.append("clipPath").attr("id", "chartClip");

  clip
    .append("rect")
    .attr("width", x(new Date(`${scenes[currentScene - 1].year}-12-31`)) || 0)
    .attr("height", height);

  drawLine(
    svg,
    g,
    data,
    "cases",
    "#003f5c",
    "New Cases per Million",
    width / 2,
    15,
    yLeft,
    x,
    );
    
  //drawLine(svg, g, data, "deaths", "#8b0000", "New Deaths per Million", width / 2 + 90, 15, yLeft, x);

  //drawLine(svg, g, data, "vaccinations", "#ff7f0e", "New Vaccinations per Million", (width / 2) + 90, 15, yRight, x);

  const revealDate = new Date(`${displayYear}-12-31`);

  if (animateChart && selectedCountry == "Mexico") {
    clip
      .select("rect")
      .transition()
      .duration(2000)
      .attr("width", x(revealDate))
      .on("end", () => {
        scenes[currentScene].annotations.forEach((annotation) => {
          addSceneAnnotation(g, fullData, annotation, x, yLeft, width, height);
        });
        
      });
  } else {
    clip.select("rect").attr("width", x(revealDate));
  }

  if (displayTooltips) {
    const casesPoint = g
      .append("circle")
      .attr("r", 5)
      .attr("fill", "#003f5c")
      .attr("display", "none");

    /*
    const deathsPoint = g
      .append("circle")
      .attr("r", 5)
      .attr("fill", "#8b0000")
      .attr("display", "none");
    
    const vaccinationPoint = g
          .append("circle")
          .attr("r", 5)
          .attr("fill", "#ff7f0e")
          .attr("display", "none");*/

    const tooltip = d3.select("#tooltip");
    const bisectDate = d3.bisector((d) => d.date).left;

    const overlay = g
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mousemove", function () {
        const mouseX = d3.mouse(this)[0];
        const date = x.invert(mouseX);

        const index = bisectDate(data, date);
        const d = data[index];

        if (!d) return;

        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${d3.timeFormat("%Y-%m-%d")(d.date)}</strong><br>
                  <span style="color:#003f5c">
                    New Cases / 1M: ${d.cases.toFixed(2)}
                </span><br>
                <span style="color:#8B0000">
                    New Deaths / 1M: ${d.deaths.toFixed(2)}
                </span><br>
                <span style="color:#ff7f0e">
                    % Vaccination: ${d.vaccinations.toFixed(2)}%
                </span>`,
          )
          .style("left", d3.event.pageX + 10 + "px")
          .style("top", d3.event.pageY - 30 + "px");

        casesPoint
          .attr("cx", x(d.date))
          .attr("cy", yLeft(d.cases))
          .style("display", "block");

        /*
        deathsPoint
          .attr("cx", x(d.date))
          .attr("cy", yLeft(d.deaths))
          .style("display", "block");

        vaccinationPoint
              .attr("cx", x(d.date))
              .attr("cy", yRight(d.vaccinations))
              .style("display", "block");*/
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
        casesPoint.style("display", "none");
        //deathsPoint.style("display", "none");
        //vaccinationPoint.style("display", "none");
      });
  }
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
    d.vaccinations = parseInt(d.people_vaccinated_per_hundred) || 0;
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

