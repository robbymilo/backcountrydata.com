const geolib = require('geolib');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const Functions = require('../functions/functions');
const Station = require('../static/station-master.json');
const avyRegions = require('../static/avy-center-points.json');

// finds nearest avy forecast region
// returns list of avy regions by distance from center of region vs. station

async function avyLookup() {
  return axios({
    method: 'get',
    url: 'https://api.avalanche.org/v2/public/products/map-layer',
  }).then(function (response) {
    // check master cache
    if (Functions.isCacheValid('avy', 'master')) {
      // console.log('avy master cache exists');
      const json = JSON.parse(
        fs.readFileSync(path.join(__dirname, '../data/avy/master.json'))
      );

      return json;
    } else {
      fs.writeFile(
        path.join(__dirname, '../data/avy/master.json'),
        JSON.stringify(response.data),
        function (err) {
          if (err) {
            return console.log('cache error: ' + err);
          } else {
            // console.log('cache write: success');
          }
        }
      );

      return response.data;
    }
  });
}

module.exports = async (req, res, next) => {
  if (Functions.isStation(req.params.id)) {
    // check cache
    if (Functions.isCacheValid('avy', req.params.id)) {
      const json = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, '../data/avy/' + req.params.id + '.json')
        )
      );
      res.send(json);
    } else {
      const lat = Station[req.params.id].latitude;
      const lon = Station[req.params.id].longitude;

      // build list
      let regionDistances = [];

      // loop through regions and find distance
      for (i = 0; i < avyRegions.length; i++) {
        const distance = geolib.getDistance(
          {
            latitude: lat,
            longitude: lon,
          },
          {
            latitude: avyRegions[i].coordinates.latitude,
            longitude: avyRegions[i].coordinates.longitude,
          }
        );

        const region = {
          distance: distance * 0.001,
          distanceUnits: 'km',
          center: avyRegions[i].center,
          name: avyRegions[i].name,
          id: avyRegions[i].id,
        };

        regionDistances.push(region);
      }

      // get forecast
      const avyReport = await avyLookup();
      // sort all regions by distance
      regionDistances.sort(function (a, b) {
        return a.distance - b.distance;
      });

      // limit array to 10 regions max
      const finalRegions = [];
      for (i = 0; i < 10; i++) {
        finalRegions.push(regionDistances[i]);
      }

      // get final region's forecast data
      for (i = 0; i < finalRegions.length; i++) {
        const found = avyReport.features.find(function (feature) {
          return feature.id == finalRegions[i].id;
        });
        if (found) {
          finalRegions[i].forecast = found.properties;
        } else {
          finalRegions[i].forecast = null;
        }
      }

      res.send(finalRegions);

      fs.writeFile(
        path.join(__dirname, '../data/avy/' + req.params.id + '.json'),
        JSON.stringify(finalRegions),
        function (err) {
          if (err) {
            return console.log('cache error: ' + err);
          } else {
            // console.log('cache write: success');
          }
        }
      );
    }
  } else {
    res.send('please enter station');
  }
};
