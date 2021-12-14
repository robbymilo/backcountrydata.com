var Functions = require('../functions/functions');
var Data = require('../models/data');

module.exports = hour_detail;

function hour_detail(req, res, next) {
  if (Functions.isStation(req.params.id)) {
    const type = 'hour';
    Data(req, res, next, type, req.params.id);
  } else {
    var err = new Error('invalid api usage');
    err.status = 404;
    return next(err);
  }
}
