var express = require('express');
var router = express.Router();
var axios = require('axios');

var bcdController = require('../controllers/bcdController');

var Avy = require('../data/static/avy-center-example.json');

router.get('/', function(req, res, next) {
	res.redirect('https://backcountrydata.com');
});

router.get('/hour/:id/:points?', bcdController.hour_detail);

router.get('/day/:id/:points?', bcdController.day_detail);

router.get('/station/:id/', bcdController.station_detail);

router.get('/nearest/:id?/', bcdController.station_nearest);

router.get('/forecast/:id/', bcdController.station_discussion);

router.get('/meso/:id/', bcdController.meso_detail);

router.get('/avy/', function(req, res, next) {
	console.log('finding forecast');
	axios
		.get('https://avalanche.org/wp-admin/admin-ajax.php?action=map_layer')
		.then(
			response => {
				res.send(response.data);
			},
			error => {
				console.log(error);
				res.send(error);
			}
		);
});

module.exports = router;
