var path = require('path');
var fs = require('fs');
var geolib = require('geolib');

var Station = require('../data/static/station-master.json');
var Functions = require('../functions/functions');

module.exports = {

    nearStation: function(req, res, next, lat, lon) {

        // get total query paran
        var total = 10;
                
        // get distance of each station
        var stationDistance = {};
        for (var key in Station) {
            if (Station.hasOwnProperty(key)) {
            
                if (Station[key].latitude) {
                    var distance = geolib.getDistance(
                        {latitude: lat, longitude: lon},
                        {latitude: Station[key].latitude, longitude: Station[key].longitude}
                    );
                    stationDistance[key] = Functions.meters_to_miles(distance);
                }
                
            }
        }

        // sort each station by distance
        var sortable = [];
        for (var site in stationDistance) {
            sortable.push([site, stationDistance[site]]);
            
        }

        sortable.sort(function(a, b) {
            return a[1] - b[1];
        });

        // return nearest 10 stations
        var nearestStations = [];
        for (i=0; i<total; i++) {

            var station = Functions.stationMeta(sortable[i][0]);
        
            nearestStations[i] = {
                'id': sortable[i][0],
                'distance': sortable[i][1],
                station,
            };
            
        }

        return nearestStations;
        
    },
    
}