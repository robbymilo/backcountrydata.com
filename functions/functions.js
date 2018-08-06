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

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
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

        // start of water year
        // find if current day of year (x of 365) is before or after october 1
        // if before, use oct-1 of previous year
        // if after, use oct-1 of this year
        



        // current day of year
        function isLeapYear(date){         
            var year = date.getFullYear();
            if((year & 3) != 0) return false;
            return ((year % 100) != 0 || (year % 400) == 0);
        };
        
        // Get Day of Year
        function getDOY(date) {
            var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
            var mn = date.getMonth();
            var dn = date.getDate();
            var dayOfYear = dayCount[mn] + dn;
            if(mn > 1 && isLeapYear(date)) dayOfYear++;
            return dayOfYear;
        };

        // today's date
        var today = new Date();
       

        var currentDays = getDOY(today);
        var waterYearStart = new Date(today.getFullYear(),10,1);
        var waterYearDays = getDOY(waterYearStart);

        //console.log(currentDays);
        //console.log(waterYearDays);

        if (currentDays < waterYearDays) {
            var waterYear = (today.getFullYear() - 1);
        } else {
            var waterYear = today.getFullYear();
        }
        console.log('water year: Oct-1-' + waterYear);

        var start = waterYear + '-10-01';
        var end = formatDate(today);
        
        return axios.get('https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/' + reportType + '/start_of_period/' + id + ':' + state + ':SNTL%7Cid=%22%22%7Cname/' + start +',' + end  + '/WTEQ::value,SNWD::value,PREC::value,TOBS::value').then(response => {
           
            console.log('data recieved from snotel')
            //res.send(response.data);
            return CSV.saveData(req, res, next, type, id, response.data);

        }).catch(response => {
            console.log(response)
        })
    }
}
