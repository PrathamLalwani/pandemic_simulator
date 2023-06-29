var BCdata;
var graphVisible = false;
var maxDay = 0;
//variables to adjust the scale
var startX = 0.07;
var startY = 0.025;
var xLength = 0.68;
var yLength = 0.8;
var legendStartHeight = startY * getSVGWidth(".svg");
var showTooltip = false;
var openGraph = false;
var provinceNameUsedForTooltip = "";
var selection = document.getElementById("diseaseAttribute");
selection.addEventListener("change", valueSelected);

document
  .querySelector("#simulator-info-dialog")
  .addEventListener("click", () => {
    const ele = document.querySelector("#simulator-info-dialog");
    ele.style.display = "none";
    d3.select(".submit-button").style("opacity", 1);
  });

document.querySelector("#form-title").addEventListener("click", () => {
  const ele = document.querySelector("#simulator-info-dialog");
  ele.style.display = "block";
});

document

  .querySelector("#diseaseAttribute")

  .addEventListener("change", () => {
    d3.select(".legend").style("visibility", "visible");
  });

/////////////////////////////////////////////////////////////////////
///////  Remove the attribute that are specific to the province//////
/////////////////////////////////////////////////////////////////////

/**
 * this method put the form
 */
function compileSpecific() {
  var currentSpecific;
  var socialDistance;
  var initialCases;
  var leavingPopulation;
  var bedCapacity;

  for (var i = 0; i < provs.length; i++) {
    provs[i][4].style.visibility = "hidden";

    currentSpecific = document.getElementById(provs[i][0]);
    socialDistance = currentSpecific.querySelector("#socialDistancing").value;
    initialCases = currentSpecific.querySelector("#initialCases").value;
    leavingPopulation =
      currentSpecific.querySelector("#leavingPopulation").value;
    incomingPopulation = currentSpecific.querySelector(
      "#incomingPopulation"
    ).value;

    bedCapacity = currentSpecific.querySelector("#bedCapacity").value;
    provs[i][1] = socialDistance;
    provs[i][2] = initialCases;
    provs[i][5] = leavingPopulation;
    provs[i][6] = incomingPopulation;
    provs[i][7] = bedCapacity;
  }
}

/**
 * hide the forms
 */
function hideForm() {
  if (!simulation) {
    document.getElementById("form-bound").style.visibility = "hidden";
    document.getElementById("show-form").style.visibility = "visible";
  } else {
  }
}

var simulationShowForm = false;
function showForm() {
  if (!simulation) {
    document.getElementById("form-bound").style.visibility = "visible";
    document.getElementById("show-form").style.visibility = "hidden";
    allChildInvisible(document.getElementById("specifics-container"));
  } else {
    simulationShowForm == false
      ? (simulationShowForm = true)
      : (simulationShowForm = false);

    if (validSelection()) {
      if (simulationShowForm) {
        document.getElementById("pop-up").style.visibility = "visible";
        document.getElementById("legend").style.visibility = "visible";
        document.getElementById("timecontrol-container").style.visibility =
          "visible";
        document.getElementById("day").style.visibility = "visible";
      } else {
        document.getElementById("pop-up").style.visibility = "hidden";
        document.getElementById("legend").style.visibility = "hidden";
        document.getElementById("timecontrol-container").style.visibility =
          "hidden";
        document.getElementById("day").style.visibility = "hidden";
      }
    }
  }
}

//////////////////////////////////////////////
////////////Display The Days of Simulation////
//////////////////////////////////////////////
let days = 0;
var timer;
var simPaused = false;

simSpeed = 50;
function increaseSpeed() {}
function decreaseSpeed() {}

var timer = 0;
function updateTime(maxDay, data) {
  timer = setInterval(function () {
    //update the days
    d3.json("populationData.json").then((population) => {
      appendTextToTooltip(population, provinceNameUsedForTooltip, days);
    });
    d3.select(".days").text("Day  \r   " + days);

    if (validSelection()) choropleth(days, data);
    if (days >= maxDay) clearInterval(timer);
    if (!simPaused) days += 1;
  }, 50);
}

/**
 * The function that get the accurate mouse position on top of the map
 */

function displayCoordinates(t) {
  lat = t.lat();
  lat = lat;
  lng = t.lng();
  lng = lng;
}

//make all the child element of the div invisible
function allChildInvisible(justDivElement) {
  var divElement = justDivElement.childNodes;
  for (let i = 0; i < divElement.length; i++) {
    if (divElement[i].nodeName.toLowerCase() == "div") {
      divElement[i].style.visibility = "hidden";
    }
  }
}

//Time Control Functions

function pauseControl() {
  var button = document.getElementById("pause-control-text");

  if (document.getElementById("diseaseAttribute").value != "") {
    if (simPaused == false) {
      button.innerHTML = "Play";
      simPaused = true;
    } else if (simPaused) {
      button.innerHTML = "Pause";
      simPaused = false;
    }
    setTimeControlState();
  }
}

function restartButton() {
  days = 0;

  document.getElementById("pause-control-text").innerHTML = "Start";
  setTimeControlState();
  clearButtonBackground();
  simPaused = true;
  clearInterval(timer);
  updateTime(document.getElementById("simulationPeriod").value, ObjectData[0]);
}

function play() {
  simPaused = false;
  setTimeControlState();
}

function stepButton(increment) {
  simPaused = true;
  let maxDay = document.getElementById("simulationPeriod").value;
  days += increment;
  console.log(days);
  if (days < 0) days = 0;
  console.log(days, maxDay);
  if (days >= maxDay) days = maxDay;
  console.log(days);

  if (days == maxDay && increment < 0) {
    days = maxDay - 1;
    updateTime(maxDay, ObjectData[0]);
  }
  console.log(days);
  setTimeControlState();
}

var timeControlVisible = false;

function toggleTimeControl() {
  if (timeControlVisible) {
    setTimeControlPannel("hidden");
    timeControlVisible = false;
  } else {
    setTimeControlPannel("visible");
    timeControlVisible = true;
  }
}

function setTimeControlPannel(string) {
  document.getElementById("timecontrol-container").style.visibility = string;
}

function setTimeControlState() {
  clearButtonBackground();
  if (simPaused) {
    document.getElementById("pauseControl").style.backgroundColor = "yellow";
  }
  if (!simPaused) {
    document.getElementById("pauseControl").style.backgroundColor = "green";
  }
}

function clearButtonBackground() {
  d3.selectAll(".timecontrol-button").style("background-color", "whitesmoke");
  d3.selectAll(".timecontrol-button").style(
    "background",
    "var(--background-color)"
  );
  d3.selectAll(".timecontrol-button").style("backdrop-filter", "blur(20px)");
}

function choropleth(theDay, data) {
  //get which one is infected
  var characteristic = document.getElementById("diseaseAttribute").value;
  let maxValue = 0;
  let province;
  let theArray;
  let theCharacteristicArray;
  let proportion;
  let maxDeath = 0;

  map.data.setStyle(function (feature) {
    province = feature.h.prov_name_en;
    province = province.split(" ").join("");
    theArray = data[province];

    theCharacteristicArray = theArray[characteristic];

    if (characteristic != "Death") {
      maxValue = d3.max(theCharacteristicArray);
      proportion = theCharacteristicArray[theDay] / maxValue;

      color = getFill(proportion);
    } else {
      Object.entries(data).forEach(([key, value]) => {
        maxDeath = Math.max(maxDeath, d3.max(value.Death));
        return maxDeath;
      });

      let proportion = theCharacteristicArray[theDay] / maxDeath;
      color = getFill(proportion);
    }
    return { fillColor: color, strokeWeight: 0.5, strokeColor: "white" };
  });
}

function validSelection() {
  if (document.getElementById("diseaseAttribute").value != "") {
    if (simulation) d3.select(".warning-message").style("visibility", "hidden");
    return true;
  } else {
    if (simulation)
      d3.select(".warning-message").style("visibility", "visible");
    return false;
  }
}

function generateGraph(data, provinceName) {
  d3.select(".svg").selectAll("*").remove();
  legendStartHeight = startY * getSVGWidth(".svg");
  let maxValue = 0;

  Object.entries(data).forEach(([, value]) => {
    maxValue = Math.max(maxValue, d3.max(value));
  });

  generateScale(
    document.getElementById("simulationPeriod").value,
    provinceName,
    maxValue
  );

  generateLine(data["Exposed"], "blue", "Exposed", maxValue);
  generateLine(
    data["Infected Asymptomatic"],
    "darkorange",
    "Infected Asymptomatic",
    maxValue
  );
  generateLine(
    data["Infected Hospitalized"],
    "grey",
    "Infected Hospitalized",
    maxValue
  );
  generateLine(
    data["Infected Symptomatic"],
    "red",
    "Infected Symptomatic",
    maxValue
  );
  generateLine(data["Recovered"], "green", "Recovered", maxValue);
  generateLine(data["Susceptible"], "pink", "Susceptible", maxValue);
  generateLine(data["Death"], "black", "Death", maxValue);
}

function generateScale(simulationPeriod, provinceName, yScaleValue) {
  var graph = new Array();

  svgHeight = getSVGHeight(".svg");
  svgWidth = getSVGWidth("svg");

  var xScale = d3
    .scaleLinear()
    .domain([0, simulationPeriod])
    .range([svgWidth * startX, svgWidth * (startX + xLength)]);

  var yScale = d3
    .scaleLinear()
    .domain([0, yScaleValue * 100])
    .range([svgHeight * (startY + yLength), svgHeight * startY]);

  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  d3.select(".svg")
    .append("g")
    .attr(
      "transform",
      "translate(" +
        svgWidth * startX +
        ", " +
        svgHeight * (startY + yLength) +
        ")"
    )
    .call(xAxis);
  d3.select(".svg")
    .append("g")
    .attr("transform", "translate(" + svgWidth * startX * 2 + ", 0)")
    .call(yAxis);

  d3.select(".svg")
    .append("text")
    .attr("x", svgWidth * startX * 0.3)
    .attr("y", svgHeight * 0.5)
    .text("(Percentage)");

  d3.select(".svg")
    .append("text")
    .attr("x", svgWidth * 0.5)
    .attr("y", svgHeight * 0.9)
    .text("Simulation Period(days)");

  d3.select(".svg")
    .append("text")
    .attr("x", svgWidth * 0.05)
    .attr("y", svgHeight * 0.92)
    .text(provinceName)
    .style("font-size", 30)
    .style("font-weight", "bold");
}

function generateLine(graphArray, color, text, maxValue) {
  let graph = new Array();
  let period = graphArray.length;
  let xExpand = (getSVGWidth(".svg") / (period - 1)) * xLength;
  let yExpand = (getSVGHeight(".svg") / maxValue) * yLength;

  for (var i = 0; i < period; i++) {
    graph.push({ day: i, percentage: graphArray[i] });
  }

  var svgHeight = getSVGHeight(".svg");

  const line = d3
    .line()
    .defined((d) => d != null)
    .curve(d3.curveCardinal)
    .x((d) => d.day * xExpand + svgWidth * (startX * 2))
    .y((d) => -d.percentage * yExpand + svgHeight * (yLength + startY));

  d3.select(".svg")
    .append("path")
    .data([graph])
    .attr("d", line)
    .style("fill", "none")
    .style("stroke", color)
    .style("stroke-width", "2px");
}

function getSVGWidth(svgName) {
  var xExpandstring = d3.select(svgName).style("width").toString();
  var svgWidth = Number(xExpandstring.substr(0, xExpandstring.length - 2));

  return svgWidth;
}

function getSVGHeight(svgName) {
  var yExpandstring = d3.select(svgName).style("height").toString();
  var svgHeight = Number(yExpandstring.substr(0, yExpandstring.length - 2));

  return svgHeight;
}

function getLeft(className) {
  let leftString = d3.select(className).style("left").toString();
  let left = Number(leftString.substr(0, leftString.length - 2));

  return left;
}

function getRight(className) {
  let rightString = d3.select(className).style("right").toString();
  let right = Number(rightString.substr(0, rightString.length - 2));

  return right;
}

function getBottom(className) {
  let bottomString = d3.select(className).style("bottom").toString();
  let bottom = Number(bottomString.substr(0, bottomString.length - 2));

  return bottom;
}

function appendLegend(data) {
  if (!Array.isArray(data)) return;
  if (data.length == 0) return;

  let characteristic = document.getElementById("diseaseAttribute").value;
  let characteristicMaxValue = data.find((item) => {
    return item[0] == characteristic;
  });
  let maxPercent = (characteristicMaxValue[1] * 100).toFixed(2);

  document.getElementById("characteristic").innerHTML = characteristic;
  document.getElementById("max-percentage").innerHTML =
    "Max Percentage: " + maxPercent + "%";
}

function getFill(proportion) {
  let color;
  proportion < 0.1
    ? (color = "rgb(0, 255, 0)")
    : proportion > 0.1 && proportion < 0.2
    ? (color = "rgb(60, 255, 0)")
    : proportion > 0.2 && proportion < 0.3
    ? (color = "rgb(120, 255, 0)")
    : proportion > 0.3 && proportion < 0.4
    ? (color = "rgb(180, 255, 0)")
    : proportion > 0.4 && proportion < 0.5
    ? (color = "rgb(240, 255, 0)")
    : proportion > 0.5 && proportion < 0.6
    ? (color = "rgb(255, 240, 0)")
    : proportion > 0.6 && proportion < 0.7
    ? (color = "rgb(255, 180, 0)")
    : proportion > 0.7 && proportion < 0.8
    ? (color = "rgb(255, 120, 0)")
    : proportion > 0.8
    ? (color = "rgb(255, 60, 0)")
    : (color = "rgb(255, 240, 0)");

  return color;
}

function generateMaxValueArray(data) {
  let dataArray = new Array();
  let maxValueArray = new Array();
  let maxValueData = new Array();
  Object.entries(data).forEach(([, value]) => {
    dataArray.push(value);
  });

  for (var i = 0; i < dataArray.length; i++) {
    let array = new Array();
    Object.entries(dataArray[i]).forEach(([key, value]) => {
      if (!Array.isArray(value)) return;
      let thisMaxValue = d3.max(value);
      array.push({ characteristic: key, ceiling: thisMaxValue });
    });
    maxValueArray.push(array);
  }

  for (var i = 0; i < maxValueArray.length; i++) {
    if (i == 0) {
      maxValueArray[i].forEach(function (array) {
        maxValueData.push(new Array(array.characteristic, array.ceiling));
      });
    } else {
      maxValueArray[i].forEach(function (array) {
        let oldMaxValue = maxValueData.find((item) => {
          return item[0] == array.characteristic;
        })[1];
        let newMaxValue = Math.max(oldMaxValue, array.ceiling);
        maxValueData.find((item) => {
          return item[0] == array.characteristic;
        })[1] = newMaxValue;
      });
    }
  }

  return maxValueData;
}

function sortDataToArray(data) {
  let theArray = new Array();
  Object.entries(data).forEach(([key, value]) => {
    theArray.push({ province: key, attribute: value });
  });

  return theArray;
}

function appendTextToTooltip(population, provinceName, day) {
  //this gets the projection coordinate for the tooltip, so the tool tip will be in the right plac

  console.log(theData);
  let provinceData = theData.find((item) => {
    return item["province"] == provinceName.split(" ").join("");
  });
  console.log(provinceData);
  let provincePopulation;
  let prov_population = population.provinces[0].find((item) => {
    return item["province"] === provinceName;
  });

  provinceData = provinceData.attribute;

  if (day > document.getElementById("simulationPeriod").value) day -= 1;
  if (
    simulation &&
    day <= document.getElementById("simulationPeriod").value &&
    showTooltip == true
  ) {
    provincePopulation = prov_population.population;

    let tooltipText = new Array({
      key: "population",
      value: provincePopulation,
    });
    Object.entries(provinceData).forEach(([key, value]) => {
      if (key === "Optimized Social Distancing") return;
      let thisEntryInfo = Math.round(value[day] * provincePopulation);
      tooltipText.push({ key: key, value: thisEntryInfo });
    });

    //remove evverything on the tooltip so it's better
    d3.select(".tooltip").selectAll("*").remove();

    //tooltipText[0].key + " : " + tooltipText[0].value
    let tooltipStartHeight = getSVGHeight(".tooltip") * 0.08;
    let spacing = getSVGHeight(".tooltip") * 0.1;

    d3.select(".tooltip")
      .append("text")
      .text(provinceName)
      .attr("x", getSVGWidth(".tooltip") * 0.5)
      .attr("y", tooltipStartHeight)
      .style("font-size", 18)
      .style("text-anchor", "middle");

    tooltipStartHeight += spacing;

    for (var i = 0; i < tooltipText.length; i++) {
      d3.select(".tooltip")
        .append("text")
        .attr("x", getSVGWidth(".tooltip") * 0.08)
        .attr("y", tooltipStartHeight)
        .text(tooltipText[i].key + " : " + tooltipText[i].value)
        .style("font-size", 14);

      tooltipStartHeight += spacing;
    }
  } //end of simulation statement
}

function updateTooltipPosition(ll, hh, w, h) {
  if (validSelection()) {
    let tooltipLeft = ll + w / 2 + 30;
    let tooltipTop = hh + h / 2 - 30;

    if (tooltipLeft + getSVGWidth(".tooltip") > getSVGWidth(".map-container"))
      tooltipLeft -= getSVGWidth(".tooltip") * 1.3;
    if (tooltipTop + getSVGHeight(".tooltip") > getSVGHeight(".map-container"))
      tooltipTop -= getSVGHeight(".tooltip") * 1.1;
    if (getLeft(".tooltip") + getSVGWidth)
      d3.select(".tooltip")
        .style("left", tooltipLeft.toString() + "px") //get the x position, somehow I have to converted it into a string else it doesn't work
        .style("top", tooltipTop.toString() + "px")
        .style("visibility", "visible"); //change the tooltip to visible, it's hidden unless we hover on it.
  }
}

function valueSelected() {
  if (selection.value != "") {
    appendLegend(maxValueArray);
    showTooltip = true;
  }
}

d3.select(".legend").append;
