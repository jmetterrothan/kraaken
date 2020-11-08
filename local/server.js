/* eslint-disable */

var fs = require('fs');
var bodyParser = require('body-parser');
var cors = require('cors');
var express = require('express');

var app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/:levelId/level', function (req, res) {
  var path = `${__dirname}\\data\\${req.params.levelId}\\level.json`;

  if (!fs.existsSync(path)) {
    res.status(404).json({
      "error": `Could not find level "${req.params.levelId}"`
    });
  } else {
    try {
      var content = fs.readFileSync(path);
      res.json(JSON.parse(content.toString()));
    } catch(e) {
      res.status(500).json({
        "error": `Could not parse level "${req.params.levelId}"`
      });
    }
  }
});

app.post('/:levelId/level', function (req, res) {
  var path = `${__dirname}\\data\\${req.params.levelId}\\level.json`;

  if (!fs.existsSync(path)) {
    res.status(404).json({
      "error": `Could not find level "${req.params.levelId}"`
    });
  } else {
    try {
      fs.writeFileSync(path, JSON.stringify(req.body, null, 2));
      res.status(200).json();
    } catch(e) {
      res.status(500).json({
        "error": `Could not save level "${req.params.levelId}" data`
      });
    }
  }
});

app.listen(3000);
