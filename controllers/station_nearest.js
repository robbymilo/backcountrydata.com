var Functions = require('../functions/functions');
var Location = require('../models/location');
var Station = require('../data/static/station-master.json');
var StationSearch = require('../data/static/station-search2.json');

module.exports = station_nearest;

function station_nearest(req, res, next) {
	var results = '';

	// station entered
	// returns nearest to station's point
	if (req.params.id && Functions.isStation(req.params.id)) {
		console.log(
			'getting nearest station to ' + Station[req.params.id].site_name
		);

		var lat = Station[req.params.id].latitude;
		var lon = Station[req.params.id].longitude;
		results = Location.nearStation(req, res, next, lat, lon);
	}
	// lat and lon entered
	// returns nearest to point
	else if (!req.params.id && (req.query.lat && req.query.lon)) {
		var lat = req.query.lat;
		var lon = req.query.lon;
		results = Location.nearStation(req, res, next, lat, lon);
	}

	// search
	// returns via query
	else if (req.query.search) {
		console.log('search term: ' + req.query.search);
		var searchArray = [];
		for (var key in StationSearch) {
			if (StationSearch.hasOwnProperty(key)) {
				if (
					Functions.stristr(StationSearch[key].site_name, req.query.search) !==
					false
				) {
					searchArray.push({
						site_name: StationSearch[key].site_name,
						id: StationSearch[key].id
					});
					// searchArray.push([
					//     StationSearch[key].site_name,
					//     StationSearch[key].id
					// ]);
				}
			}
		}

		console.log(searchArray.length + ' results for ' + req.query.search);
		results = searchArray;
	} else {
		var err = new Error('invalid api usage');
		err.status = 404;
		results = next(err);
	}

    res.send(results);
}