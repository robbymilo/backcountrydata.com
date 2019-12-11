var axios = require('axios');
var parser = require('xml2json');
var {parse} = require('node-html-parser');
var Station = require('../data/static/station-master.json');

const path = require('path');
const fs = require('fs');

const Functions = require('../functions/functions');


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

async function getHazard(hazardUrl) {
	console.log('fetching hazard text')
	return axios({
		method: "get",
		url: hazardUrl
	}).then(response => response.data);
}

module.exports = async (req, res, next, id) => {

	// check cache
	if (Functions.isCacheValid('forecast', id)) {
		console.log('forecast cache valid');
		const json = JSON.parse(
			fs.readFileSync(
				path.join(__dirname, '../data/forecast/' + id + '.json')
			)
		);
		res.send(json);

	} else {
	
		const lat = Station[id].latitude;
		const lon = Station[id].longitude;

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

		const graphicalLookupUrl = 'https://forecast.weather.gov/MapClick.php?lat=' + lat + '&lon=' + lon + '&unit=1&lg=english&FcstType=digitalDWML'
		let graphicalForecast = await getForecastGraphical(graphicalLookupUrl);
		graphicalForecast = parser.toJson(graphicalForecast, {
			object: true
		});

		let hazardFinal = '';
		if ( !forecast.data.hazard == []) { 
			const hazardUrl = 'http://forecast.weather.gov/showsigwx.php?warnzone=CAZ069&warncounty=CAC003&firewxzone=CAZ269&local_place1=7+Miles+SSE+Carson+Pass+CA&product1=Winter+Storm+Warning';
			const hazard = await getHazard(hazardUrl);
			const hazardParsed = parse(hazard, { pre: true });
			hazardFinal = hazardParsed.querySelector('#content pre');
		}
		

		const result = {};
		result['stationLookupUrl'] = stationLookupUrl;
		result['nwsOffice'] = nwsOfficeURL;
		result['discussionLookupUrl'] = discussionLookupUrl;
		result['discussion'] = discussion;
		result['forecastLookupUrl'] = forecastLookupUrl;
		result['forecast'] = forecast;
		result['forecastGraphicalUrl'] = graphicalLookupUrl;
		result['forecastGraphical'] = graphicalForecast.dwml.data.parameters;
		if(!hazardFinal == null) {
			result['hazard'] = hazardFinal.toString();
		} else {
			result['hazard'] = null;
		}
		res.send(result);

		fs.writeFile(
			path.join(__dirname, '../data/forecast/' + id + '.json'),
			JSON.stringify(result),
			function(err) {
				if (err) {
					return console.log('cache error: ' + err);
				} else {
					console.log('cache write: success');
				}
			}
		);

	}

};
