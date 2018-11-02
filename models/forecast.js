var axios = require('axios');
var parser = require('xml2json');

// 43.76377,-116.09685
// https://forecast.weather.gov/MapClick.php?lat=43.76377&lon=-116.09685&unit=0&lg=english&FcstType=digitalDWML

module.exports = function(req, res, next, lat, lon) {
	var result = {};
	var stationLookupUrl = 'https://api.weather.gov/points/' + lat + ',' + lon;
	var graphicalLookupUrl = 'https://forecast.weather.gov/MapClick.php?lat=' + lat + '&lon=' + lon + '&unit=0&lg=english&FcstType=digitalDWML'

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
							
							axios.get(graphicalLookupUrl).then(
								response => {								

									var forecastGraphical = parser.toJson(response.data, {
										object: true
									});
									result['forecastGraphical'] = forecastGraphical.dwml.data.parameters;		
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
		},
		error => {
			console.log(error);
			res.send(error);
		}
	);
};
