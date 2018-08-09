var path = require('path');
var fs = require('fs');
var axios = require('axios');

var Functions = require('../functions/functions');
var Data = require('../models/data');
var Station = require('../data/static/station-master.json');

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
        console.log('days: ' + req.params.points);
        var type = 'day';
        Data(req, res, next, type, req.params.id);       
        
    } else {
        var err = new Error('invalid api usage');
        err.status = 404;
        return next(err);
    }

}

exports.station_detail = function(req, res, next) {

    if (Functions.isStation(req.params.id)) {
        res.send(Station[req.params.id]);
    } else {
        var err = new Error('invalid api usage');
        err.status = 404;
        return next(err);
    }

}


exports.meso_detail = function(req, res, next) {

    if (Functions.isStation(req.params.id)) {

        // compare snotel id with mesowest
        // need to consider how to combine latest mesowest data with snotel csv
        // previous day + current day from mesowest
        // after that snotel csv

        var stid = Station[req.params.id].station;

        axios.get('https://api.mesowest.net/v2/stations/timeseries', {
            params: {
                token: 'b66df2a69170468d96e105380cf25b68',
                stid: stid,
                recent: '240',
                obtimezone: 'local',
                units: 'temp|F,speed|mph,precip|in',
                'timeformat': '%Y-%m-%d %I:%M',
                'network': '25'
            }
        }).then((response) => {	
            
            if (response.data.SUMMARY.RESPONSE_CODE == 1 ) {
                res.send(response.data);
            } else {
                res.send(response.data);
                
            }

        }, (error) => {
            console.log(error)
        })
    }
}