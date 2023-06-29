function generateReport(provinceName, provinceData, newWindow) {
  provinceData = provinceData.attribute;
  body = newWindow.document.body;
  head = newWindow.document.head;
  const pageTitle = newWindow.document.createElement("p");
  pageTitle.innerText = provinceName;
  pageTitle.classList.add("page-title");
  body.append(pageTitle);
  body = body.append(newWindow.document.createElement("main"));
  body = newWindow.document.querySelector("main");
  for (const property in provinceData) {
    var data = provinceData[property];
    if (!Array.isArray(data)) continue;
    const yMax = Math.max(1, d3.max(data));
    var n = data.length;
    var svgHeight = 300;
    var svgWidth = window.innerWidth / 2.5;
    var margin = { top: 40, right: 40, bottom: 40, left: 40 };
    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;
    const div = document.createElement("div");
    const title = document.createElement("p");
    title.innerText = property;
    title.classList.add("graph-title");
    div.append(title);
    div.classList.add(property.split(" ").join(""));
    body.append(div);
    var svg = d3
      .select(div)
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .append("g")
      .attr("transform", `translate(${margin.top}, ${margin.bottom})`);

    var xScale = d3
      .scaleLinear()
      .domain([0, n - 1])
      .range([0, width]);
    var yScale = d3.scaleLinear().domain([0, yMax]).range([height, 0]);
    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(10);
    const xAxisGrid = d3
      .axisBottom(xScale)
      .tickSize(-height)
      .tickFormat("")
      .ticks(10);
    const yAxisGrid = d3
      .axisLeft(yScale)
      .tickSize(-width)
      .tickFormat("")
      .ticks(10);

    var line = d3
      .line()
      .x(function (d, i) {
        return xScale(i);
      })
      .y(function (d) {
        return yScale(d.y);
      });
    data_mapped = data.map(function (x) {
      return { y: x };
    });
    svg
      .append("g")
      .attr("class", "x axis-grid")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxisGrid);
    svg.append("g").attr("class", "y axis-grid").call(yAxisGrid);
    // Create axes.
    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
    svg.append("g").attr("class", "y axis").call(yAxis);
    svg.append("path").datum(data_mapped).attr("class", "line").attr("d", line);

    var numberOfTicks = 6;
  }

  var styles = `
  .line{
    fill: none;
    stroke: blue;
    stroke-width:2.5px;
  }
  .axis-grid{
    color:gray;
    opacity:0.2;
  }
  main{
    display: grid;
    width: 100vw;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    grid-template-columns: repeat(2,1fr);
    overflow-x: hidden;
    justify-items: center;
  }
  
  div{
    box-shadow: 0 0 10px black;
    height: fit-content;
    width: fit-content;
    margin: 2%;
    border-radius: 12px;
    text-align:center;
    background-color:white;
  }
  .graph-title{
    font-family: 'Open sans';
    font-weight: bold;
    font-size: 20px;
  }
  .page-title{
    font-family: 'Open sans';
font-weight: bold;
font-size: 60px;
display: block;
text-align: center;
color: white;
  }
  body{
    background-color: rgb(7, 113, 135);
overflow-x: hidden;
  }
  `;
  var styleSheet = newWindow.document.createElement("style");
  styleSheet.innerText = styles;
  head.appendChild(styleSheet);
  var link = newWindow.document.createElement("link");
  link.setAttribute("rel", "stylesheet");
  link.setAttribute("type", "text/css");
  link.setAttribute(
    "href",
    "https://fonts.googleapis.com/css?family=Open+Sans:400italic,400,300,700"
  );
  head.appendChild(link);
}
