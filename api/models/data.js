var path = require('path');
var fs = require('fs');
var axios = require('axios');
var CSV = require('../functions/csv');

var Station = require('../data/static/station-master.json');
var Functions = require('../functions/functions');

// performs cache check

async function getData(req, res, next, type, id, url) {
  return axios({
    method: 'get',
    url: url,
  })
    .then((response) =>
      CSV.saveData(req, res, next, type, id, url, response.data)
    )
    .catch((error) => console.log(error));
}

module.exports = async (req, res, next, type, id) => {
  if (Functions.isCacheValid(type, id)) {
    var json = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, '../data/' + type + '/' + id + '.json')
      )
    );
    var total = req.query.total;
    var empty = req.query.empty;

    var url = Functions.buildRequest(Station, type, id);

    var data = Functions.buildResponse(json, total, url, id, empty);

    res.send(data);
  } else {
    const url = Functions.buildRequest(Station, type, id);
    const newData = await getData(req, res, next, type, id, url);
    return newData;
  }
};
