var express = require('express');
var router = express.Router();
var controller = require('../controllers')

router.get('/', function(req, res, next) {
	res.redirect('https://backcountrydata.com');
});

router.get('/hour/:id/', controller.hour_detail);

router.get('/day/:id/', controller.day_detail);

router.get('/station/:id/', controller.station_detail);

router.get('/nearest/:id?/', controller.station_nearest);

router.get('/forecast/:id/', controller.station_discussion);

router.get('/avy/:id', controller.avy_center);

router.get('/state/:state', controller.state);

module.exports = router;
