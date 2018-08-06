var express = require('express');
var router = express.Router();

var hour_controller = require('../controllers/hourController');


router.get('/', function(req, res, next) {
    res.render('index', { title: 'API' });
});

router.get('/hour/:id/:points?', hour_controller.hour_detail);

router.get('/day/:id/:points?', hour_controller.day_detail);

router.get('/hour/', hour_controller.hour_list);

module.exports = router;  