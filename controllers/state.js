var path = require('path');
var fs = require('fs');

var Functions = require('../functions/functions');
var csvtojson = require('csvtojson');
var axios = require('axios');

async function allStations(state) {
	return axios({
		method: "get",
		url: 'https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customMultiTimeSeriesGroupByStationReport,metric/hourly/start_of_period/state=%22' + state + '%22%20AND%20network=%22SNTLT%22,%22SNTL%22%20AND%20outServiceDate=%222100-01-01%22%7Cname/-168,0/stationId,name,SNWD::value?fitToScreen=false'
	}).then(response => response.data);
}

module.exports = async (req, res, next) => {
    // check if state is valid
    const stateInput = req.params.state.toUpperCase();
    const type = 'state';
    if(Functions.isState(stateInput)) {

        let stateData = await allStations(stateInput);
        stateData = stateData.split('\n')
				.slice(134)
                .join('\n');

        // loop through each line to replace header name with ID only
        var header = stateData.split('\n');
        header = header[1].match(/[0-9]+/g);
        header.unshift('date')
        
        stateData = stateData.split('\n')
				.slice(2)
                .join('\n');


        csvtojson({
            noheader: true,
            headers: header,
            checkType:true
        })
            .preRawData((stateData)=>{
                return stateData;
            })
            .fromString(stateData)
            .then(finalData => {
                res.send(finalData);
            })

        
        
        // if (Functions.isCacheValid('state', stateInput)) {
        //     console.log('sending cached data');
        //     const json = JSON.parse(
        //         fs.readFileSync(
        //             path.join(__dirname, '../data/' + type + '/' + stateInput + '.json')
        //         )
        //     );
        //     res.send(json);
        // } else {
        //     console.log('getting new data');
            
        //     // data parse
        //     let currentState = await allStations(stateInput);
        //     res.send(currentState);

        //     console.log('caching data');
		// 		fs.writeFile(
		// 			path.join(__dirname, '../data/' + type + '/' + stateInput + '.json'),
        //             // JSON.stringify(json),
        //             JSON.stringify({'test': 'test'}),
		// 			function(err, data) {
		// 				if (err) {
		// 					return console.log('cache error: ' + err);
		// 				} else {
		// 					console.log('cache write: success');
		// 				}
		// 			}
		// 		);
        // }
    } else {
        res.send('invalid state')
    }	
};