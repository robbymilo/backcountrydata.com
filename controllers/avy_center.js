var Functions = require('../functions/functions');
var Station = require('../data/static/station-master.json');

module.exports = avy_center;

function avy_center(req, res, next) {
	console.log('finding station avy center');
	if (Functions.isStation(req.params.id)) {
		var lat = Station[req.params.id].latitude;
		var lon = Station[req.params.id].longitude;
		res.send(JSON.stringify(lat));

	} else {
		res.send('please enter station')
	}
	
	
};