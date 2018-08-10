var path = require('path');
var fs = require('fs');
var axios = require('axios');
var geolib = require('geolib');
var parser = require('xml2json');

var Functions = require('../functions/functions');
var Data = require('../models/data');
var Location = require('../models/location');
var Forecast = require('../models/forecast');
var Station = require('../data/static/station-master.json');
var StationSearch = require('../data/static/station-search2.json');

// performs station check

exports.hour_detail = function(req, res, next) {
	if (Functions.isStation(req.params.id)) {
		console.log('station: ' + req.params.id);
		console.log('hours: ' + req.params.points);
		var type = 'hour';
		Data(req, res, next, type, req.params.id);
	} else {
		var err = new Error('invalid api usage');
		err.status = 404;
		return next(err);
	}
};

exports.day_detail = function(req, res, next) {
	if (Functions.isStation(req.params.id)) {
		console.log('station: ' + req.params.id);
		console.log('days: ' + req.params.points);
		var type = 'day';
		Data(req, res, next, type, req.params.id);
	} else {
		var err = new Error('invalid api usage');
		err.status = 404;
		return next(err);
	}
};

exports.station_detail = function(req, res, next) {
	if (Functions.isStation(req.params.id)) {
		res.send(Station[req.params.id]);
	} else {
		var err = new Error('invalid api usage');
		err.status = 404;
		return next(err);
	}
};

exports.station_nearest = function(req, res, next) {
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
};

exports.station_discussion = function(req, res, next) {
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
exports.meso_detail = function(req, res, next) {
	if (Functions.isStation(req.params.id)) {
		// compare snotel id with mesowest
		// need to consider how to combine latest mesowest data with snotel csv
		// previous day + current day from mesowest
		// after that snotel csv

		var stid = Station[req.params.id].station;

		axios
			.get('https://api.mesowest.net/v2/stations/timeseries', {
				params: {
					token: 'b66df2a69170468d96e105380cf25b68',
					stid: stid,
					recent: '240000',
					obtimezone: 'local',
					units: 'temp|C,speed|mph,precip|in',
					timeformat: '%Y-%m-%d %I:%M',
					network: '25'
				}
			})
			.then(
				response => {
					if (response.data.SUMMARY.RESPONSE_CODE == 1) {
						res.send(response.data);
					} else {
						res.send(response.data);
					}
				},
				error => {
					console.log(error);
				}
			);
	}
};
