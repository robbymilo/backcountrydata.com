var path = require('path');
var fs = require('fs');
var functions = require('../functions/functions');
var Hour = require('../models/hour');
var axios = require('axios');

// https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/hourly/start_of_period/637:ID:SNTL%7Cid=%22%22%7Cname/2017-10-01,2018-07-15/WTEQ::value,SNWD::value,PREC::value,TOBS::value


exports.hour_detail = function(req, res, next) {

    // check if station exists
    if (functions.isStation(req.params.id)) {
        // TODO: get parent route
        //Hour('hour', req.params.id);
        
        return axios.get('https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/hourly/start_of_period/637:ID:SNTL%7Cid=%22%22%7Cname/2017-10-01,2018-07-15/WTEQ::value,SNWD::value,PREC::value,TOBS::value').then(response => {
            console.log('data recieved')
            res.send(response.data);
            console.log('data sent')
        }).catch(response => {
            console.log(response)
        })

    } else {
        var err = new Error('invalid api usage');
        err.status = 404;
        return next(err);
    }

}

exports.hour_list = function(req, res, next) {
    res.send('need station id')
}