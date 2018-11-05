var Functions = require('../functions/functions');
var Forecast = require('../models/forecast');
var Station = require('../data/static/station-master.json');

module.exports = station_discussion;

function station_discussion(req, res, next) {
	if (Functions.isStation(req.params.id)) {
        
		var lat = Station[req.params.id].latitude;
		var lon = Station[req.params.id].longitude;
        Forecast(req, res, next, lat, lon);
        
	} else {
		var err = new Error('invalid api usage');
		err.status = 404;
		results = next(err);
	}
};