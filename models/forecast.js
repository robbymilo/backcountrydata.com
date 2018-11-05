var axios = require('axios');
var parser = require('xml2json');

// 43.76377,-116.09685
// https://forecast.weather.gov/MapClick.php?lat=43.76377&lon=-116.09685&unit=0&lg=english&FcstType=digitalDWML

// lookup NWS station so we can retrieve forecast discussion
async function stationLookup(stationLookupUrl) {
	return axios({
		method: "get",
		url: stationLookupUrl
	}).then(response => response.data['properties']['forecastOffice']);
}

// get forecast discussion from NWS
async function getDiscussion(discussionLookupUrl) {
	return axios({
		method: "get",
		url: discussionLookupUrl
	}).then(response => response.data);
}

// get human-readable forecast
async function getForecast(forecastLookupUrl) {
	return axios({
		method: "get",
		url: forecastLookupUrl
	}).then(response => response.data);
}

// get forecast data for charting
async function getForecastGraphical(graphicalLookupUrl) {
	return axios({
		method: "get",
		url: graphicalLookupUrl
	}).then(response => response.data);
}

module.exports = async (req, res, next, lat, lon) => {

	const stationLookupUrl = 'https://api.weather.gov/points/' + lat + ',' + lon;
	const nwsOfficeURL = await stationLookup(stationLookupUrl);
	const nwsOffice = nwsOfficeURL.replace('https://api.weather.gov/offices/', '');

	const discussionLookupUrl =	'https://www.wrh.noaa.gov/total_forecast/getprod.php?afos=xxxafd' +	nwsOffice +	'&xml';
	let discussion = await getDiscussion(discussionLookupUrl);
	discussion = parser.toJson(discussion, {
		object: true
	});

	const forecastLookupUrl = 'https://forecast.weather.gov/MapClick.php?lat=' + lat + '&lon=' + lon + '&FcstType=json';
	const forecast = await getForecast(forecastLookupUrl);

	const graphicalLookupUrl = 'https://forecast.weather.gov/MapClick.php?lat=' + lat + '&lon=' + lon + '&unit=0&lg=english&FcstType=digitalDWML'
	let graphicalForecast = await getForecastGraphical(graphicalLookupUrl);
	graphicalForecast = parser.toJson(graphicalForecast, {
		object: true
	});

	const result = {};
	result['stationLookupUrl'] = stationLookupUrl;
	result['nwsOffice'] = nwsOfficeURL;
	result['discussionLookupUrl'] = discussionLookupUrl;
	result['discussion'] = discussion;
	result['forecastLookupUrl'] = forecastLookupUrl;
	result['forecast'] = forecast;
	result['forecastGraphical'] = graphicalForecast.dwml.data.parameters;

	res.send(result);
};
