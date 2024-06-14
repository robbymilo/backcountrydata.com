var axios = require('axios');
const parser = require('xml-js');
var {parse} = require('node-html-parser');
var Station = require('../static/station-master.json');

const path = require('path');
const fs = require('fs');

const Functions = require('../functions/functions');

// 43.76377,-116.09685
// https://forecast.weather.gov/MapClick.php?lat=43.76377&lon=-116.09685&unit=0&lg=english&FcstType=digitalDWML

// lookup NWS station so we can retrieve forecast discussion
async function stationLookup(stationLookupUrl) {
  return axios({
    method: 'get',
    url: stationLookupUrl,
  })
    .then((response) => response.data['properties']['forecastOffice'])
    .catch((error) => console.log(error));
}

// get forecast discussion from NWS
async function getDiscussion(discussionLookupUrl) {
  return axios({
    method: 'get',
    url: discussionLookupUrl,
  })
    .then((response) => response.data)
    .catch((error) => console.log(error));
}

// get human-readable forecast
async function getForecast(forecastLookupUrl) {
  return axios({
    method: 'get',
    url: forecastLookupUrl,
  })
    .then(function (response) {
      if (
        typeof response.data === 'string' &&
        response.data.includes('<script')
      ) {
        return null;
      } else {
        return response.data;
      }
    })
    .catch((error) => console.log(error));
}

// get forecast data for charting
async function getForecastGraphical(graphicalLookupUrl) {
  return axios({
    method: 'get',
    url: graphicalLookupUrl,
  })
    .then((response) => response.data)
    .catch((error) => console.log(error));
}

async function getHazard(hazardUrl) {
  return axios({
    method: 'get',
    url: hazardUrl,
  })
    .then((response) => response.data)
    .catch((error) => console.log(error));
}

module.exports = async (req, res, next, id) => {
  // check cache
  if (Functions.isCacheValid('forecast', id)) {
    const json = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../data/forecast/' + id + '.json'))
    );
    if (json) {
      res.send(json);
    } else {
      res.sendStatus(502);
    }
  } else {
    const lat = Station[id].latitude;
    const lon = Station[id].longitude;

    const stationLookupUrl =
      'https://api.weather.gov/points/' + lat + ',' + lon;
    const nwsOfficeURL = await stationLookup(stationLookupUrl);
    const nwsOffice = nwsOfficeURL.replace(
      'https://api.weather.gov/offices/',
      ''
    );

    const discussionLookupUrl = `https://forecast.weather.gov/product.php?site=${nwsOffice}&issuedby=${nwsOffice}&product=AFD&format=txt`;
    let discussion = await getDiscussion(discussionLookupUrl);

    if (discussion) {
      discussion = parse(discussion).querySelector('.glossaryProduct')
        .innerText; // thanks nws
    }

    const forecastLookupUrl =
      'https://forecast.weather.gov/MapClick.php?lat=' +
      lat +
      '&lon=' +
      lon +
      '&FcstType=json';
    const forecast = await getForecast(forecastLookupUrl);

    let average = (array) =>
      array.reduce((a, b) => parseInt(a) + parseInt(b)) / array.length;

    let snowForecast = [];

    if (forecast && forecast.data && forecast.data.text) {
      forecast.data.text.forEach(function (element) {
        if (element.includes('accumulation of')) {
          const snowRaw = element.split('accumulation of ');
          const snowArray = snowRaw.pop().match(/\d+/g);
          if (snowArray === null) {
            snowForecast.push(0);
          } else {
            const snowAverage = average(snowArray);
            snowForecast.push(snowAverage);
          }
        } else {
          snowForecast.push(0);
        }
      });
    }

    const graphicalLookupUrl =
      'https://forecast.weather.gov/MapClick.php?lat=' +
      lat +
      '&lon=' +
      lon +
      '&unit=1&lg=english&FcstType=digitalDWML';
    let graphicalForecast = await getForecastGraphical(graphicalLookupUrl);
    graphicalForecast = parser.xml2json(graphicalForecast);

    let hazardFinal = '';
    if (forecast && forecast.data && !forecast.data.hazard == []) {
      const hazardUrl =
        'http://forecast.weather.gov/showsigwx.php?warnzone=CAZ069&warncounty=CAC003&firewxzone=CAZ269&local_place1=7+Miles+SSE+Carson+Pass+CA&product1=Winter+Storm+Warning';
      const hazard = await getHazard(hazardUrl);
      const hazardParsed = parse(hazard, {pre: true});
      hazardFinal = hazardParsed.querySelector('#content pre');
    } else {
      hazardFinal = null;
    }

    const result = {};
    result['stationLookupUrl'] = stationLookupUrl;
    result['nwsOffice'] = nwsOfficeURL;
    result['discussionLookupUrl'] = discussionLookupUrl;
    if (discussion) {
      result['discussion'] = discussion;
    }
    result['forecastLookupUrl'] = forecastLookupUrl;
    result['forecast'] = forecast;
    result['forecastGraphicalUrl'] = graphicalLookupUrl;
    if (
      graphicalForecast &&
      graphicalForecast.dwml &&
      graphicalForecast.dwml.data.parameters
    ) {
      result['forecastGraphical'] = graphicalForecast.dwml.data.parameters;
    } else {
      result['forecastGraphical'] = null;
    }
    result['forecastSnow'] = snowForecast;
    if (!hazardFinal == null) {
      result['hazard'] = hazardFinal.toString();
    } else {
      result['hazard'] = null;
    }
    res.send(result);

    fs.mkdirSync(path.join(__dirname, '../data/forecast'), {recursive: true});
    fs.writeFile(
      path.join(__dirname, '../data/forecast/' + id + '.json'),
      JSON.stringify(result),
      function (err) {
        if (err) {
          return console.log('cache error: ' + err);
        }
      }
    );
  }
};
