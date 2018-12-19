const geolib = require('geolib');
var axios = require('axios');

const Functions = require('../functions/functions');
const Station = require('../data/static/station-master.json');
const avyRegions = require('../data/static/avy-center-points.json');

// finds nearest avy forecast region
// returns list of avy regions by distance from center of region vs. station 

async function avyLookup() {
	return axios({
		method: "get",
		url: 'https://avalanche.org/wp-admin/admin-ajax.php?action=map_layer'
	}).then(response => response.data);
}

module.exports = async (req, res, next) => {
	console.log('finding station avy center');
	if (Functions.isStation(req.params.id)) {
		const lat = Station[req.params.id].latitude;
        const lon = Station[req.params.id].longitude;

        // build list
        let regionDistances = [];

        // loop through regions and find distance
        for(i=0; i<avyRegions.length; i++) {
            const distance = geolib.getDistance(
                {
                    latitude: lat, 
                    longitude: lon
                },
                {
                    latitude: avyRegions[i].coordinates.latitude, 
                    longitude: avyRegions[i].coordinates.longitude
                }
            );
            
            const region = {
                "distance": distance * 0.001,
                "distanceUnits": "km",
                "center": avyRegions[i].center,
                "name": avyRegions[i].name,
                "id": avyRegions[i].id,
            };           

            regionDistances.push(region);
        }

        // get forecast
        const avyReport = await avyLookup();
        
        // sort all regions by distance
        regionDistances.sort(function (a, b) {
            return a.distance - b.distance;
        })

        // limit array to 10 regions max
        const finalRegions = [];
        for (i=0; i<10; i++) {
            finalRegions.push(regionDistances[i]);
        }

        // get final region's forecast data
        for(i=0; i<finalRegions.length; i++) {
            const found = avyReport.features.find(function(feature) {                          
                return feature.id == finalRegions[i].id
            });
            finalRegions[i].forecast = found;                        
        }   
        
		res.send(finalRegions);

	} else {
		res.send('please enter station')
	}
	
	
};