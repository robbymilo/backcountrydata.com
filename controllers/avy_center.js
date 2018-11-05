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
                "distance": Functions.meters_to_miles(distance),
                "center": avyRegions[i].center,
                "name": avyRegions[i].name,
                "id": avyRegions[i].id,
            };           

            regionDistances.push(region);
        }
    
        regionDistances.sort(function (a, b) {
            return a.distance - b.distance;
        })

        const finalRegions = [];

        for (i=0; i<10; i++) {
            finalRegions.push(regionDistances[i]);
        }

        const avyReport = await avyLookup();

		res.send(finalRegions);

	} else {
		res.send('please enter station')
	}
	
	
};