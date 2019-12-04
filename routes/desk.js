var express = require('express'),
    router = express.Router();

var mongoose = require('mongoose'),
    CheckConfig = mongoose.model( 'CheckConfig' ),
    ObjectId = mongoose.Types.ObjectId;

/* GET /desk */
/* Show all configuration */
router.get( '/', function(req, res) 
{   
    //retrieve all from Monogo
    CheckConfig.find( {}, null, { sort: 'group_name' }, function ( err, configs ) 
    {
        if (err) return console.error(err);

        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
        res.format({
            html: function()
            {
                res.render( 'desk.html', { configs: configs })
            },
            json: function()
            {
                res.json( configs );
            }
        })
    })
});

module.exports = router;
