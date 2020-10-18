const geolib = require('geolib');
const fs = require('fs');
const avyMaster = require('./data/static/avy-center-example.json');

// Finds the center point of avy center polygons and saves them to a json file

// build final data to save
const centerPoints = [];

// loop through forecast zones
for (i = 0; i < avyMaster.features.length; i++) {
  if (avyMaster.features[i].geometry.type == 'Polygon') {
    console.log(avyMaster.features[i].geometry.type);
    const center = {
      coordinates: geolib.getCenter(
        avyMaster.features[i].geometry.coordinates[0]
      ),
      center: avyMaster.features[i].properties.center,
      name: avyMaster.features[i].properties.name,
      id: avyMaster.features[i].id,
    };
    centerPoints.push(center);
  } else if (avyMaster.features[i].geometry.type == 'MultiPolygon') {
    console.log(avyMaster.features[i].geometry.type);
    const center = {
      coordinates: geolib.getCenter(
        avyMaster.features[i].geometry.coordinates[0][0]
      ),
      center: avyMaster.features[i].properties.center,
      name: avyMaster.features[i].properties.name,
      id: avyMaster.features[i].id,
    };
    centerPoints.push(center);
  }
}

console.log(centerPoints);

fs.writeFile(
  './data/static/avy-center-points.json',
  JSON.stringify(centerPoints),
  (err) => {
    if (err) throw err;
    console.log('geo.json saved');
  }
);
