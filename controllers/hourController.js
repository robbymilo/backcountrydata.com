var path = require('path');
var fs = require('fs');
var axios = require('axios');

var Functions = require('../functions/functions');
var Data = require('../models/data');

// performs station check

exports.hour_detail = function(req, res, next) {

    if (Functions.isStation(req.params.id)) {

        console.log('station: ' + req.params.id);
        console.log('hours: ' + req.params.points);
        var type = 'hour';
        Data(req, res, next, type, req.params.id);       
        
    } else {
        var err = new Error('invalid api usage');
        err.status = 404;
        return next(err);
    }

}

exports.day_detail = function(req, res, next) {

    if (Functions.isStation(req.params.id)) {

        console.log('station: ' + req.params.id);
        var type = 'day';
        Data(req, res, next, type, req.params.id);       
        
    } else {
        var err = new Error('invalid api usage');
        err.status = 404;
        return next(err);
    }

}

exports.hour_list = function(req, res, next) {
    res.send('need station id')
}