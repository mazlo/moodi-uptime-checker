var express = require('express');
var route = express.Router();

var mongoose = require('mongoose'),
    CheckConfig = mongoose.model( 'CheckConfig' ),
    ObjectId = mongoose.Types.ObjectId

/* GET /uptime-checks/ */
/* Show all CheckConfig */
route.get( '/', function(req, res) 
{   
    //retrieve all from Monogo
    CheckConfig.find( {}, function ( err, configs ) 
    {
        if (err) return console.error(err);

        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
        res.format({
            html: function()
            {
                res.render( 'uptime-checks.html', 
                {
                    configs: configs
                })
            },
            json: function()
            {
                res.json( configs );
            }
        })
    })
});

module.exports = route;