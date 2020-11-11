/* eslint-disable */

var fs = require('fs');
var bodyParser = require('body-parser');
var cors = require('cors');
var express = require('express');

var PORT = 3000;

var app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(`${__dirname}/public`));

app.post('/:levelId/level', function (req, res) {
  var path = `${__dirname}\\public\\${req.params.levelId}\\level.json`;

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

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
});
