var path = require('path');
var fs = require('fs');
var csvtojson = require('csvtojson');

var Functions = require('../functions/functions');

module.exports = {
  saveData: function (req, res, next, type, id, url, data) {
    const lines = data.split(/\r?\n/);
    const headerIndex = lines.findIndex((line) => line.startsWith('Date,'));
    if (headerIndex === -1) {
      throw new Error("No CSV header found (no line starting with 'Date,').");
    }
    const filtered = lines.slice(headerIndex).join('\n');

    csvtojson({
      noheader: false,
      headers: ['date', 'sw', 'sd', 'pa', 'at', 'wd', 'ws', 'wg'],
      checkType: true,
    })
      .fromString(filtered)
      .then((json) => {
        var raw = json;
        fs.mkdirSync(path.join(__dirname, '../data/', type), {recursive: true});
        fs.writeFile(
          path.join(__dirname, '../data/' + type + '/' + id + '.json'),
          JSON.stringify(raw),
          function (err) {
            if (err) {
              return console.log('cache error: ' + err);
            } else {
              // console.log('cache write: success');
            }
          }
        );
        // send to browser
        var total = req.query.total;
        var empty = req.query.empty;

        var final = Functions.buildResponse(json, total, url, id, empty);

        res.send(final);
      });
  },
};
