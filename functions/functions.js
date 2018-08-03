var path = require('path');
var fs = require('fs');
var axios = require('axios');

// https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }

module.exports = {

    isStation: function (n) {
        if(isNumeric(n) && (n == 637 || n == 978 || n == 123 )) {
            return true;        
        } else {
            return false;
        }
    },
    isCacheValid: function(type, id) {
        // check if file is over 15 minutes old
        var stats = fs.statSync(path.join(__dirname, '../data/' + type + '/' + id + '.json'));

        var quarterHour = 900000
        var age = quarterHour;
     
        if ( ((Date.now()) - stats.mtimeMs) < age) {
            return true;
        } else {
            return false;
        }
    },
    doesFileExist: function(type, id) {

        if (fs.existsSync(path.join(__dirname, '../data/' + type + '/' + id + '.json'))) {
            return true;
        } else {
            return false;
        }
    },    
    getOldData: function(type, id) {
        var json = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/' + type + '/' + id + '.json')));
        return json;
    },
    getNewData: function(type, id) {
        return axios.get('https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/hourly/start_of_period/637:ID:SNTL%7Cid=%22%22%7Cname/2017-10-01,2018-07-15/WTEQ::value,SNWD::value,PREC::value,TOBS::value')
       


    },
}
