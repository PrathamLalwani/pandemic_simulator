var simulation = false; //to see whether the the simulation started or not
var provs = new Array(); //the array that stores different data for initial cases and social distancing
var lastProvince; //the current province that the mouse has selected
var currentProvinceName;
var deathArray = new Array();
var lat;
var lng;
var mapLayer;
var w;
var h;
var selectionColor = "darkgrey";
var hoverColor = "lightyellow";
var provinceNameFromMouseOver = "";
/////////////////////////////////////////////////////////
/// EVERYTHING ABOUT THE GOOGLE MAP BELOW  //////////////
/////////////////////////////////////////////////////////

let map;
//This is the object that consist the boundary that limit where we can go in Google Map, in the initMap() we limite the boundary

//no idea how to get the boundary from the geoJason data, made randomly
const CanadaBounds = {
  north: 75,
  south: 41,
  east: -52,
  west: -160,
};

const selectElement = document.querySelector("diseaseAttribute");

function initMap() {
  /////////////////////////////////////////
  ////// Initial Variables For the Map/////
  /////////////////////////////////////////
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 56.415211, lng: -98.739075 },
    zoom: 1,
    disableDefaultUI: true,
    mapTypeId: "satellite",
    scrollwheel: true,
    maxZoom: 7,
    minZoom: 1,
    //This limit the boundary
    restriction: {
      latLngBounds: CanadaBounds,
      strictBounds: false,
    },
  });

  //this variable is for the displaying of province, if google map is in full screen, this variable will not work.
  w = map.getDiv().offsetWidth;
  h = map.getDiv().offsetHeight;

  /////////////////////////////////////////////////////////////////////////////////////
  //// Must include a OverlayView if want to display things on top of Google Map///////
  /////////////////////////////////////////////////////////////////////////////////////
  var overlay = new google.maps.OverlayView();

  /////////////////////////////////////////////////////////////////////////
  ///////// Must have onAdd function in order to include the element///////
  /////////////////////////////////////////////////////////////////////////
  overlay.onAdd = function () {
    d3.select(".days")
      .style("left", w)
      .style("top", 0)
      .text("Day  \r   " + days);
  }; //////// End of onAdd

  //load the geoJson file, this displays the canada map
  map.data.loadGeoJson("georef-canada-province.geojson");
  map.data.setStyle({
    fillColor: "rgb(0,255,0)",
    strokeColor: "white",
    strokeWeight: 0.5,
  });

  //////////////////////////////////////////////////////
  //////////// Display the Option for the attributes ///
  ///////////  That are specific to Each Province   ////
  //////////////////////////////////////////////////////
  d3.json("georef-canada-province.geojson").then((data) => {
    d3.json("populationData.json").then((pop) => {
      let totalProvince = pop.provinces[0].length;
      //generate the information in the specifics for the province
      for (var i = 0; i < totalProvince; i++) {
        //get the province population data
        var prov_pop = pop.provinces[0][i];
        var prov_name = prov_pop.province;
        var populationNumber = prov_pop.population;

        var prov_specific = document.getElementById("specifics");
        var newSubject = prov_specific.cloneNode(true);
        newSubject.id = prov_name;
        document.getElementById("specifics-container").appendChild(newSubject);

        provs.push([
          prov_name,
          0.5,
          0,
          populationNumber,
          newSubject,
          300,
          300,
          10,
        ]);

        newSubject.insertAdjacentText("afterbegin", prov_name);
        newSubject.style.visibility = "hidden";
      }
    }); //end of the populationData.json loading
  }); //end of the georef-canada-province.geojson loading

  mapLayer = map.data;
  /////////////////////////////////////////////////////////
  //////////// Map Click on Province//////////////////////
  ///////////////////////////////////////////////////////
  var sameProvince = false;
  map.data.addListener("click", function (event) {
    const container = document.getElementById("specifics-container");

    if (lastProvince != null) map.data.revertStyle(lastProvince);
    if (currentProvinceName == event.feature.h.prov_name_en) {
      sameProvince == true ? (sameProvince = false) : (sameProvince = true);
    } else {
      sameProvince = false;
    }

    currentProvinceName = event.feature.h.prov_name_en;

    if (!sameProvince && (validSelection() || !simulation))
      map.data.overrideStyle(event.feature, { fillColor: selectionColor });
    lastProvince = event.feature;

    d3.json("populationData.json").then((population) => {
      var prov_population = population.provinces[0].find((item) => {
        return item["province"] === currentProvinceName;
      });

      //only when the user is customizing the field options will the user
      //be able to see the option to modify the specific informations belong to a province
      //Also there are 13 different province field options in total, only the selected province will be visible
      if (simulation == false) {
        //make every province specific hidden
        provs.forEach((item) => (item[4].style.visibility = "hidden"));

        container.style.width = "0%";
        container.style.height = "0%";
        if (!sameProvince) {
          container.style.width = "70%";
          container.style.height = "fit-content";
          container.style.left = "2%";
          container.style.top = "2%";
          const ele = document.getElementById(currentProvinceName);
          ele.style.visibility = "visible";
          ele.style.width = "30%";
          ele.style.height = "fit-content";
        }
      } //end of if simulation == false statement

      //append province population to the specific container
      document.getElementById(currentProvinceName).childNodes[2].innerText =
        "Population:" + prov_population.population.toString();

      d3.select(".specifics").style("width", "0px"); //get the x position, somehow I have to converted it into a string else it doesn't ;
    });

    if (validSelection()) {
      var newWindow = window.open("");
      var document_body = newWindow.document.body;
      if (newWindow == null) {
        alert("change your popup settings");
      } else {
        newWindow.moveTo(0, 0);
        newWindow.resizeTo(screen.width, screen.height);
        newWindow.document.title = currentProvinceName;
        let provinceData = theData.find((item) => {
          return item["province"] == currentProvinceName.split(" ").join("");
        });
        generateReport(currentProvinceName, provinceData, newWindow);
        // theData.forEach((item) => {
        //   if (item.province == currentProvinceName.split(" ").join("")) {
        //     newWindow.opener.generateGraph(item.attribute, currentProvinceName);

        //     sameProvince == true ? (openGraph = false) : (openGraph = true);
        //   }
        // });
      }
    }
  }); ////// End of Mouse Click

  /////////////////////////////////////////////////////
  //////// Mouse Hovering /////////////////////////////
  /////////////////////////////////////////////////////

  map.data.addListener("mouseover", function (event) {
    if (validSelection() || simulation == false) {
      // make the border line of province look thicker when mouse hovers on it
      map.data.overrideStyle(event.feature, {
        strokeWeight: 0.5,
        strokeColor: "green",
        fillColor: hoverColor,
      });

      d3.json("populationData.json").then((population) => {
        console.log(event);
        let thisProvinceName = event.feature.h.prov_name_en;
        console.log(population);
        appendTextToTooltip(population, thisProvinceName, days - 1);
      });
    }

    provinceNameUsedForTooltip = event.feature.h.prov_name_en;

    //update the province name necessary
  });

  map.data.addListener("mousemove", function (event) {
    displayCoordinates(event.latLng);
    var f = overlay
      .getProjection()
      .fromLatLngToDivPixel(new google.maps.LatLng(lat, lng));
    let ll = f.x;
    let hh = f.y;

    updateTooltipPosition(ll, hh, w, h);
  });

  /////////////////////////////////////////////////////////
  ////////////// When mouse move out of the province//////
  ////////////////////////////////////////////////////////

  //make the tool tip hidden when the mouse no longer on top of the province
  map.data.addListener("mouseout", function (event) {
    d3.select(".tooltip") //tooltip is when hovering over a certain area, information will be displayed
      .style("visibility", "hidden"); //change the tooltip to visible, it's hidden unless we hover on it.

    document.getElementById("tooltip").style.visibility = "hidden";

    //make the border stroke back to normal
    map.data.revertStyle();
    if (!sameProvince && (validSelection() || !simulation))
      map.data.overrideStyle(lastProvince, { fillColor: selectionColor });
  }); ////end of Mouse out

  overlay.setMap(map); //needed to make the google map api work

  //hide the form before opening the webpage, this make the user see map in full screen when open the webpage
}

//document.getElementById("map-container").style.width = "100%";

window.initMap = initMap; //must include to initialize the map
