var path = require('path');
var fs = require('fs');
var axios = require('axios');
var CSV = require('../functions/csv');

var Station = require('../data/static/station-master.json');
var Functions = require('../functions/functions');

// performs cache check

module.exports = function(req, res, next, type, id) {
	if (Functions.isCacheValid(type, id)) {
		console.log('sending cached data');
		var json = JSON.parse(
			fs.readFileSync(
				path.join(__dirname, '../data/' + type + '/' + id + '.json')
			)
		);

		if (req.query.total) {
			var total = json.slice(Math.max(json.length - req.query.total, 1));
		} else {
			var total = json;
		}

		var url = Functions.buildRequest(Station, type, id);

		var data = Functions.buildResponse(total, url, id);

		res.send(data);
	} else {
		console.log('getting new data');
		var url = Functions.buildRequest(Station, type, id);

		return axios
			.get(url)
			.then(response => {
				console.log('data recieved from snotel');
				return CSV.saveData(req, res, next, type, id, url, response.data);
			})
			.catch(response => {
				console.log(response);
			});
	}
};
