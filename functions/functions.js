var path = require('path');
var fs = require('fs');
var axios = require('axios');

var Station = require('../data/static/station-master.json');

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
    buildRequest: function(Station, type, id) {
        var reportType = '';
        if (type == 'hour') {
            reportType = 'hourly';
        } else if ( type == 'day') {
            reportType = 'daily';
        }
    
        var state = Station[id].state;
    
        // https://stackoverflow.com/questions/8619879/javascript-calculate-the-day-of-the-year-1-366
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
        var url = 'https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport,metric/' + reportType + '/start_of_period/' + id + ':' + state + ':SNTL%7Cid=%22%22%7Cname/' + start +',' + end  + '/WTEQ::value,SNWD::value,PREC::value,TOBS::value';
    
        return url;
    },
    buildResponse: function(total, url, id) {
        var date_stamp = [];
        var air_temp = [];
        var snow_depth = [];
        var snow_water_equiv = [];
        var percip_accum = [];

        for (i=0; i<total.length; i++) {
            date_stamp.push(total[i].date);
            air_temp.push(total[i].at);

            if(total[i].sd < 0 || total[i].sd == "") {
                snow_depth.push(null);
            } else {
                snow_depth.push(total[i].sd);
            }

            if(total[i].sw < 0 || total[i].sw == "") {
                snow_water_equiv.push(null);
            } else {
                snow_water_equiv.push(total[i].snow_depth);
            }
            
            percip_accum.push(total[i].pa);
        }

        var data = {
            'request_url': url,
            'station': {                
                "state": Station[id].state,
                "site_name": Station[id].site_name,
                "county": Station[id].county,
                "info": Station[id].info,
                "latitude": Station[id].latitude,
                "longitude": Station[id].longitude,
                "elev": Station[id].elev,
                "stid": Station[id].station
            },
            'units': {
                'time_zone': 'GMT-08:00',
                'elevation': 'm',
                'air_temp': 'celsius',
                'snow_depth': 'mm',
                'snow_water_equiv': 'mm',
                'percip_accum': 'mm',
            },
            'data': {
                'date_time': date_stamp,
                'air_temp': air_temp,
                'snow_depth': snow_depth,
                'snow_water_equiv': snow_water_equiv,
                'percip_accum': percip_accum,
            },
        };

        return data;
    },

    getMesoWest: function(req, res, next, id) {
        axios.get('https://api.mesowest.net/v2/stations/timeseries', {
            params: {
                token: 'b66df2a69170468d96e105380cf25b68',
                stid: id,
                recent: '1880',
                obtimezone: 'local'
            }
        }).then((response) => {	
            vm.loading = false;
            if (response.data.SUMMARY.RESPONSE_CODE == 1 ) {
                console.warn('Success: mesowest by stid found');
                vm.responseOw = '';
                vm.error = '';

                // Page Title
                document.title = response.data.STATION[0].NAME + " Weather";
                
                // Get nearby stations	
                
                vm.mesowest = response.data;
                vm.meso = response.data.STATION[0].OBSERVATIONS;

                // Current Temp
                var current_temp_position = vm.meso.air_temp_set_1.length -1
                var current_temp = vm.meso.air_temp_set_1[current_temp_position];
                vm.meso.air_temp_latest = vm.meso.air_temp_set_1[current_temp_position];

                // Previous Temp
                var previous_temp_position = vm.meso.air_temp_set_1.length -2
                var previous_temp = vm.meso.air_temp_set_1[previous_temp_position];

                // Temp Comparison
                if (current_temp > previous_temp) {
                    vm.isIncrease = true;
                    console.log(current_temp + ' > ' + previous_temp)
                    vm.interval = setInterval(function () {
                        vm.isIncrease = false;
                    }.bind(vm), 3000); 
                } else if (current_temp < previous_temp) {
                    vm.isDecrease = true;
                    console.log(current_temp + ' < ' + previous_temp)
                    vm.interval = setInterval(function () {
                        vm.isDecrease = false;
                    }.bind(vm), 3000); 
                }

                if (callback1) {
                    callback1(current_temp);
                }
                

                // Latest reported time
                var current_date_position = vm.meso.date_time.length -1;
                vm.meso.date_time_latest = vm.meso.date_time[current_date_position];

                // Wind
                if (vm.meso.wind_speed_set_1) {
                    var current_wind_position = vm.meso.wind_speed_set_1.length -1;
                    vm.meso.wind_speed_latest = vm.meso.wind_speed_set_1[current_wind_position];
                    if (vm.meso.wind_speed_latest == 0 || vm.meso.wind_speed_latest == null) {
                        vm.meso.wind_speed_latest = 0
                    }
                }
                
                if (vm.meso.wind_direction_set_1) {
                    var current_wind_direction_position = vm.meso.wind_direction_set_1.length -1;
                    vm.meso.wind_direction_latest = vm.meso.wind_direction_set_1[current_wind_direction_position];
                }
                
                if (vm.meso.wind_gust_set_1) {
                    var current_wind_gust_position = vm.meso.wind_gust_set_1.length -1;                        
                    vm.meso.wind_gust_latest = vm.meso.wind_gust_set_1[current_wind_gust_position];
                }

                // Humidity
                if (vm.meso.relative_humidity_set_1) {
                    var current_humidity_position = vm.meso.relative_humidity_set_1.length -1;
                    vm.meso.relative_humidity_latest = Math.round(vm.meso.relative_humidity_set_1[current_humidity_position], 2);
                }

                // Precip

                // Snow!
                if(vm.meso.snow_depth_set_1) {
                    var current_snowdepth_position = vm.meso.snow_depth_set_1.length -1;
                    vm.meso.snow_depth_latest = vm.meso.snow_depth_set_1[current_snowdepth_position];        
                }
                

                // Get related stations and data
                if (callback2) {
                    callback2(vm.mesowest.STATION[0].LATITUDE, vm.mesowest.STATION[0].LONGITUDE);
                }
                
                // Get open weather info
                if (callback3){
                    callback3(vm.mesowest.STATION[0].LATITUDE, vm.mesowest.STATION[0].LONGITUDE)
                }
                

            } else {
                console.warn('no mesowest station found ')
                vm.mesowest = '';
                vm.mesowestNear = '';
                    
                if (callback4) {
                    callback4(vm.query.input);
                }
                
            }

        }, (error) => {
            console.log(error)
        })
    },
}
