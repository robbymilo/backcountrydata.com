var path = require('path');
var fs = require('fs');
var csvtojson = require('csvtojson');

var Functions = require('../functions/functions');

module.exports = {
	saveData: function(req, res, next, type, id, url, data) {
		if (type == 'hour') {
			var filtered = data
				.split('\n')
				.slice(59)
				.join('\n');
		} else {
			var filtered = data
				.split('\n')
				.slice(60)
				.join('\n');
		}

		csvtojson({
			noheader: true,
			headers: ['date', 'sw', 'sd', 'pa', 'at', 'wd', 'ws', 'wg'],
			checkType: true
		})
			.fromString(filtered)
			.then(json => {
				// send to browser
				console.log('sending fresh data to browser');

				if (req.query.total) {
					var total = json.slice(Math.max(json.length - req.query.total, 1));
				} else {
					var total = json;
				}

				var data = Functions.buildResponse(total, url, id);

				res.send(data);

				console.log('caching data');
				fs.writeFile(
					path.join(__dirname, '../data/' + type + '/' + id + '.json'),
					JSON.stringify(json),
					function(err, data) {
						if (err) {
							return console.log('cache error: ' + err);
						} else {
							console.log('cache write: success');
						}
					}
				);
			});
	}
};
