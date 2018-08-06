var path = require('path');
var fs = require('fs');
var axios = require('axios');

var Functions = require('../functions/functions');

// performs cache check

module.exports = function(req, res, next, type, id) {
    if (Functions.isCacheValid(type, id)) {

        return Functions.getOldData(req, res, next, type, id);

    } else {
        return Functions.getNewData(req, res, next, type, id);
    }   
    
}