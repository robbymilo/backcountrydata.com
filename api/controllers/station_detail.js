var Functions = require('../functions/functions');
var Station = require('../static/station-master.json');

module.exports = station_detail;

function station_detail(req, res, next) {
  if (Functions.isStation(req.params.id)) {
    res.send(Station[req.params.id]);
  } else {
    var err = new Error('invalid api usage');
    err.status = 404;
    return next(err);
  }
}
