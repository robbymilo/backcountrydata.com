var path = require('path');
var fs = require('fs');
var csvtojson = require('csvtojson');

var Functions = require('../functions/functions');

module.exports = {
  saveData: function (req, res, next, type, id, url, data) {
    if (type == 'hour') {
      var filtered = data.split('\n').slice(64).join('\n');
    } else {
      var filtered = data.split('\n').slice(65).join('\n');
    }

    csvtojson({
      noheader: true,
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
