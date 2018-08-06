var express = require('express');
var router = express.Router();

var bcdController = require('../controllers/bcdController');


router.get('/', function(req, res, next) {
    res.render('index', { title: 'API' });
});

router.get('/hour/:id/:points?', bcdController.hour_detail);

router.get('/day/:id/:points?', bcdController.day_detail);

router.get('/station/:id/', bcdController.station_detail);


module.exports = router;  