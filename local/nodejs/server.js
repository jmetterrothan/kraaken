/* eslint-disable */

var fs = require('fs');
var bodyParser = require('body-parser');
var cors = require('cors');
var express = require('express');

var PORT = 3000;

var app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static());

app.post('/api/:levelId', function (req, res) {
  var { levelId } = req.params;
  var path = `${__dirname}\\levels\\${levelId}\\level.json`;

  if (!fs.existsSync(path)) {
    res.status(404).json({
      "error": `Could not find level "${levelId}"`
    });
  } else {
    try {
      fs.writeFileSync(path, JSON.stringify(req.body, null, 2));
      res.status(200).json();
    } catch(e) {
      res.status(400).json({
        "error": `Could not save level "${levelId}" data`
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
});
