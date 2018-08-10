var axios = require('axios');
var parser = require('xml2json');

var Station = require('../data/static/station-master.json');

module.exports = function(req, res, next, lat, lon) {
	var result = {};
	var stationLookupUrl = 'https://api.weather.gov/points/' + lat + ',' + lon;

	result['stationLookupUrl'] = stationLookupUrl;

	// find station's forecast office
	console.log('finding office');
	axios.get(stationLookupUrl).then(
		response => {
			var nwsOffice = response.data['properties']['forecastOffice'];
			result['nwsOffice'] = nwsOffice;
			nwsOffice = nwsOffice.replace('https://api.weather.gov/offices/', '');

			var discussionLookupUrl =
				'https://www.wrh.noaa.gov/total_forecast/getprod.php?afos=xxxafd' +
				nwsOffice +
				'&xml';
			result['discussionLookupUrl'] = discussionLookupUrl;

			console.log('finding discussion');
			axios.get(discussionLookupUrl).then(
				response => {
					var json = parser.toJson(response.data, {
						object: true
					});

					result['discussion'] = json;

					var forecastLookupUrl =
						'https://forecast.weather.gov/MapClick.php?lat=' +
						lat +
						'&lon=' +
						lon +
						'&FcstType=json';
					result['forecastLookupUrl'] = forecastLookupUrl;

					console.log('finding forecast');
					axios.get(forecastLookupUrl).then(
						response => {
							result['forecast'] = response.data;

							res.send(result);
						},
						error => {
							console.log(error);
							res.send(error);
						}
					);
				},
				error => {
					console.log(error);
					res.send(error);
				}
			);
		},
		error => {
			console.log(error);
			res.send(error);
		}
	);
};
