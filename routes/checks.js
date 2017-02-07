var express = require('express'),
    route = express.Router(),
    intervalsHelper = require( '../helpers/intervalsHelper' );

var mongoose = require('mongoose'),
    CheckConfig = mongoose.model( 'CheckConfig' ),
    Check = mongoose.model( 'Check' ),
    ObjectId = mongoose.Types.ObjectId

/* GET /uptime-checks/ */
/* Show all CheckConfig */
route.get( '/', function(req, res) 
{   
    //retrieve all from Monogo
    CheckConfig.find( {}, null, { sort: 'group_name' }, function ( err, configs ) 
    {
        if (err) return console.error(err);

        //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
        res.format({
            html: function()
            {
                res.render( 'uptime-checks.html', { configs: configs })
            },
            json: function()
            {
                res.json( configs );
            }
        })
    })
});

/* POST /uptime-checks */
/* Create a new CheckConfig */
route.post( '/', function( req, res )
{
    var config = new CheckConfig( req.body )

    config.save( function( err )
    {
        if ( err ) console.log( err )

        intervalsHelper.handleRecurrentCheckConfiguration( req, config )

        res.redirect( '/uptime-checks' )
    })
})

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
                    res.render( 'uptime-check-details.html', 
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
            { new : true },
            function( err, config ) 
            {
                if ( err ) console.log( err )
                if ( config == undefined ) res.json( { status: 500 } )

                config.save( function( err )
                {
                    intervalsHelper.handleRecurrentCheckConfiguration( req, config )
                    
                    res.redirect( '/uptime-checks' )
                })
            })
})

module.exports = route;