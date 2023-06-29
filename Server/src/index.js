const express = require("express");
const app = express();
const fs = require("fs");
const { spawn } = require("child_process");
const cors = require("cors");
const bodyParser = require("body-parser");
const { json } = require("body-parser");
var jsonParser = bodyParser.json();
const port = 5000;
app.use(
  cors({
    origin: "*",
  })
);

app.post("/", jsonParser, (req, res) => {
  fs.writeFileSync("data.json", JSON.stringify(req.body), function (err) {
    if (err) throw err;
    console.log("Saved!");
  });
  console.log(req.body);
  const childPython = spawn("python", [
    "SEIRD Model/model.py",
    JSON.stringify(req.body),
  ]);
  childPython.stdout.on("data", (data) => {});

  childPython.stderr.on("data", (data) => {
    console.log(`${data}`);
  });
  childPython.on("close", (code) => {
    console.log(`Exited with code: ${code}`);
    jsonString = fs.readFileSync("result.json", "utf-8");
    result = JSON.parse(jsonString);
    res.send(result);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
