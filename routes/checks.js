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

    if ( config.interval == undefined || config.interval == '' || config.interval == 0 )
        config.interval = 60

    config.save( function( err )
    {
        if ( err ) console.log( err )

        intervalsHelper.handleRecurrentCheckConfiguration( req, config )

        res.redirect( '/uptime-checks/'+ config._id )
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

/* GET /uptime-checks/:id/once */
/* Invokes CheckConfig only once */
route.get( '/:cid/once', function( req, res )
{
    CheckConfig
        .findById( req.params['cid'] )
        .exec( function( err, config )
        {
            if ( err ) console.log( err )
            if ( config == undefined ) res.json( { status: 500 } )

            intervalsHelper.doTask( req, config )
            
            res.json( { message: 'ok' } )
        })
})

/* POST /uptime-checks/:id */
/* Update one CheckConfig with given :id VIA FORM */
route.post( '/:cid', function( req, res )
{
    // this is passed to mongoose update method
    var configFiltered = req.body

    // user submitted assumptions form -> validate
    if ( req.body.assumptions && req.body.assumptions.length > 0 )
    {
        configFiltered = { 
            // filter those where label is empty
            assumptions: req.body.assumptions.filter( function( assumption )
            {
                if ( assumption.label == '' )
                    return false

                return true
            }) 
        }
    }

    CheckConfig
        .findOneAndUpdate( 
            { "_id" : req.params['cid'] },
            { "$set" : configFiltered },
            { new : true },
            function( err, config ) 
            {
                if ( err ) console.log( err )
                if ( config == undefined ) res.json( { status: 500 } )

                if ( config.interval == undefined || config.interval == '' || config.interval == 0 )
                    config.interval = 60

                config.save( function( err )
                {
                    intervalsHelper.handleRecurrentCheckConfiguration( req, config )
                    
                    res.redirect( '/uptime-checks/'+ req.params['cid'] )
                })
            })
})

/* PUT /uptime-checks/:id */
/* Update one CheckConfig with given :id VIA AJAX */
route.put( '/:cid', function( req, res )
{
    CheckConfig
        .findOneAndUpdate( 
            { "_id" : req.params['cid'] },
            { "$set" : { 'active': req.body.active } },
            { new: true },
            function( err, config )
            {
                if ( err ) console.log( err )
                if ( config == undefined ) 
                    res.status(500).json( { 
                        message: 'config not found for given id '+ req.params['cid'], 
                        status: 500 
                    } )

                config.save( function( err )
                {
                    intervalsHelper.handleRecurrentCheckConfiguration( req, config )
                    
                    res.json( { 
                        message: 'success',
                        when: 'every '+ config.interval +'s'
                    } )
                })
            }
        )
})

/* GET /uptime-checks/:id/assumptions */
/* Returns details about the executed Assumptions of a CheckConfig */
route.get( '/:cid/assumptions', function( req, res )
{
    CheckConfig
        .findById( req.params['cid'] )
        .populate( 'checks' )
        .exec( function( err, config )
        {
            if ( err ) console.log( err )
            if ( config == undefined ) res.json( { status: 500 } )
            
            res.render( 'uptime-check-assumptions-details.html', { config: config })
        })
})

module.exports = route;