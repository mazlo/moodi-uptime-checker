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

/* GET /uptime-checks/create */
/* Show form to create new CheckConfig */
route.get( '/create', function( req, res )
{
    res.render( 'uptime-check-create.html' )
})

/* GET /uptime-checks/:id */
/* Show details for CheckConfig with given :id */
route.get( '/:cid', function( req, res )
{
    CheckConfig
        .findById( req.params['cid'] )
        .populate( 'checkconfigs.checks' )
        .exec( function( err, config )
        {
            res.format({
                html: function()
                {
                    res.render( 'check-details.html', 
                    {
                        config: config
                    })
                },
                json: function()
                {
                    res.json( config );
                }
            })
        })
})

/* POST /uptime-checks/:id */
/* Update one CheckConfig with given :id */
route.post( '/:cid', function( req, res )
{
    CheckConfig
        .findOneAndUpdate( 
            { "_id" : req.params['cid'] },
            { "$set" : req.body },
            function( err, config ) 
            {
                if ( err ) console.log( err )
                if ( config == undefined ) res.json( { status: 500 } )

                config.save()

                res.redirect( '/uptime-checks' )
            })
})

module.exports = route;