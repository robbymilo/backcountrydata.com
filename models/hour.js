var functions = require('../functions/functions');
var axios = require('axios');

//Export model
module.exports = function(type, id) {
    if (functions.doesFileExist(type, id) && functions.isCacheValid(type, id)) {
        console.log('old data')
        return functions.getOldData(type, id);
    } else {
        console.log('new data')
       
        return axios.get('https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/hourly/start_of_period/637:ID:SNTL%7Cid=%22%22%7Cname/2017-10-01,2018-07-15/WTEQ::value,SNWD::value,PREC::value,TOBS::value').then(response => {
            console.log('data recieved')
        })
    }
    
}