var express = require('express');
var router = express.Router();

var bcdController = require('../controllers/bcdController');


router.get('/', function(req, res, next) {
    res.redirect('https://backcountrydata.com');
});

router.get('/hour/:id/:points?', bcdController.hour_detail);

router.get('/day/:id/:points?', bcdController.day_detail);

router.get('/station/:id/', bcdController.station_detail);

router.get('/nearest/:id?/', bcdController.station_nearest);

router.get('/discussion/:id/', bcdController.station_discussion);

router.get('/meso/:id/', bcdController.meso_detail);


module.exports = router;  