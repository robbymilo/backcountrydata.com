var Functions = require('../functions/functions');
var Forecast = require('../models/forecast');

module.exports = station_discussion;

function station_discussion(req, res, next) {
	if (Functions.isStation(req.params.id)) {

        Forecast(req, res, next, req.params.id);
        
	} else {
		var err = new Error('invalid api usage');
		err.status = 404;
		results = next(err);
	}
};