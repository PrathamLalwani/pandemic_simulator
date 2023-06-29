var maxValueArray = new Array();
var theData = new Array();
var ObjectData = new Array(); // the data the the API sent back
const form = document.querySelector("#submission-form");
function submit_button(event) {
  event.preventDefault();

  window.scroll(0, 0);
  window.onscroll = () => {
    window.scroll(0, 0);
  };

  let element = document.getElementById("day");

  element.style.visibility = "visible";

  document.getElementById("form-bound").style.visibility = "hidden";
  document.getElementById("show-form").style.visibility = "visible";
  d3.select(".death-legend").style("visibility", "hidden");

  //Shows the simulation controls and pauses so user can decide when to start
  document.getElementById("pop-up").style.visibility = "visible";
  setTimeControlPannel("visible");

  simPaused = true;

  simulation = true;
  compileSpecific();

  const payload = new FormData(event.target);

  const value = Object.fromEntries(payload.entries());

  //Beginning of province data object, this can be moved to a different file
  console.log(value);
  let provData = {
    incubationPeriod: value.incubationPeriod,
    infectivePeriod: value.infectivePeriod,
    transmissionRate: value.transmissionRate,
    chanceOfAsymptomatic: value.chanceOfAsymptomatic,
    chanceOfHospitalization: value.chanceOfHospitalization,
    deathRateAfterHospitalization: value.deathRateAfterHospitalization,
    mutationPeriod: value.mutationPeriod,
    simulationPeriod: value.simulationPeriod,
    provideSocialDistancing: value.provideSocialDistancing,
    Alberta: {
      initialCases: provs[0][2],
      socialDistanceValue: provs[0][1],
      population: provs[0][3],
      leavingPopulation: provs[0][5],
      incomingPopulation: provs[0][6],
      bedCapacity: provs[0][7],
    },

    BritishColumbia: {
      initialCases: provs[2][2],
      socialDistanceValue: provs[2][1],
      population: provs[2][3],
      leavingPopulation: provs[2][5],
      incomingPopulation: provs[2][6],
      bedCapacity: provs[2][7],
    },

    Manitoba: {
      initialCases: provs[4][2],
      socialDistanceValue: provs[4][1],
      population: provs[4][3],
      leavingPopulation: provs[4][5],
      incomingPopulation: provs[4][6],
      bedCapacity: provs[4][7],
    },

    NewBrunswick: {
      initialCases: provs[6][2],
      socialDistanceValue: provs[6][1],
      population: provs[6][3],
      leavingPopulation: provs[6][5],
      incomingPopulation: provs[6][6],
      bedCapacity: provs[6][7],
    },

    NewfoundlandandLabrador: {
      initialCases: provs[1][2],
      socialDistanceValue: provs[1][1],
      population: provs[1][3],
      leavingPopulation: provs[1][5],
      incomingPopulation: provs[1][6],
      bedCapacity: provs[1][7],
    },

    NovaScotia: {
      initialCases: provs[5][2],
      socialDistanceValue: provs[5][1],
      population: provs[5][3],
      leavingPopulation: provs[5][5],
      incomingPopulation: provs[5][6],
      bedCapacity: provs[5][7],
    },

    Ontario: {
      initialCases: provs[9][2],
      socialDistanceValue: provs[9][1],
      population: provs[9][3],
      leavingPopulation: provs[9][5],
      incomingPopulation: provs[9][6],
      bedCapacity: provs[9][7],
    },

    PrinceEdwardIsland: {
      initialCases: provs[3][2],
      socialDistanceValue: provs[3][1],
      population: provs[3][3],
      leavingPopulation: provs[3][5],
      incomingPopulation: provs[3][6],
      bedCapacity: provs[3][7],
    },

    Quebec: {
      initialCases: provs[7][2],
      socialDistanceValue: provs[7][1],
      population: provs[7][3],
      leavingPopulation: provs[7][5],
      incomingPopulation: provs[7][6],
      bedCapacity: provs[7][7],
    },

    Saskatchewan: {
      initialCases: provs[11][2],
      socialDistanceValue: provs[11][1],
      population: provs[11][3],
      leavingPopulation: provs[11][5],
      incomingPopulation: provs[11][6],
      bedCapacity: provs[11][7],
    },

    NorthwestTerritories: {
      initialCases: provs[8][2],
      socialDistanceValue: provs[8][1],
      population: provs[8][3],
      leavingPopulation: provs[8][5],
      incomingPopulation: provs[8][6],
      bedCapacity: provs[8][7],
    },

    Nunavut: {
      initialCases: provs[10][2],
      socialDistanceValue: provs[10][1],
      population: provs[10][3],
      leavingPopulation: provs[10][5],
      incomingPopulation: provs[10][6],
      bedCapacity: provs[10][7],
    },
    Yukon: {
      initialCases: provs[12][2],
      socialDistanceValue: provs[12][1],
      population: provs[12][3],
      leavingPopulation: provs[12][5],
      incomingPopulation: provs[12][6],
      bedCapacity: provs[12][7],
    },
  };

  /* 
    http://httpbin.org/post
    Test adress for api              
    */

  document.querySelector(".loading-screen").style.display = "flex";
  fetch("http://localhost:5000/", {
    method: "POST",
    body: JSON.stringify({ provData }),
    headers: { "Content-type": "application/json" },
  })
    .then((res) => res.json())
    .then((data) => {
      theData = sortDataToArray(data);
      updateTime(document.getElementById("simulationPeriod").value, data);

      ObjectData.push(data);
      //this is needed to generate graph

      maxValueArray = generateMaxValueArray(data);
      document.querySelector(".loading-screen").style.display = "none";
    })

    .catch((err) => {
      document.querySelector(".loading-screen").style.display = "none";

      console.log(err);
    });

  return false;
}

form.addEventListener("submit", submit_button);
