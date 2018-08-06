var path = require('path');
var fs = require('fs');
var axios = require('axios');

var Station = require('../data/static/station-master.json');
var CSV = require('../functions/csv');


// https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function doesFileExist(type, id) {

    if (fs.existsSync(path.join(__dirname, '../data/' + type + '/' + id + '.json'))) {
        console.log('file exists');
        return true;
    } else {
        console.log('file does not exist');
        return false;
    }
}

module.exports = {

    isStation: function (id) {

        if(isNumeric(id) && ( (id in Station) )) {
            console.log('station exists');
            return true;        
        } else {
            console.log('station does not exist');
            return false;
        }
    },
    isCacheValid: function(type, id) {

        // check if file is over 15 minutes old
        if(doesFileExist(type, id)) {
            var stats = fs.statSync(path.join(__dirname, '../data/' + type + '/' + id + '.json'));

            var quarterHour = 900000
            var age = quarterHour;
         
            if ( ((Date.now()) - stats.mtimeMs) < age) {
                console.log('cache is valid');
                return true;
            } else {
                console.log('cache is not valid');
                return false;
            }
        } else {
            return false;
        }
        
    }, 
    getOldData: function(req, res, next, type, id) {

        console.log('sending cached data')
        var json = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/' + type + '/' + id + '.json')));
        
        if (req.params.points) {
            var total = json.slice(Math.max(json.length - req.params.points, 1))
        } else {
            var total = json;
        }        

        res.send(total);
    },
    getNewData: function(req, res, next, type, id) {

        console.log('getting new data')

        var reportType = '';
        if (type == 'hour') {
            reportType = 'hourly';
        } else if ( type == 'day') {
            reportType = 'daily';
        }

        var state = Station[id].state;
        console.log(state)
        
        return axios.get('https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/' + reportType + '/start_of_period/' + id + ':' + state + ':SNTL%7Cid=%22%22%7Cname/2017-10-01,2018-07-15/WTEQ::value,SNWD::value,PREC::value,TOBS::value').then(response => {
           
            console.log('data recieved from snotel')
            //res.send(response.data);
            return CSV.saveData(req, res, next, type, id, response.data);

        }).catch(response => {
            console.log(response)
        })
    }
}
