var express = require('express'),
    route = express.Router(),
    intervalsHelper = require( '../helpers/intervalsHelper' );

var mongoose = require('mongoose'),
    CheckConfig = mongoose.model( 'CheckConfig' ),
    Check = mongoose.model( 'Check' ),
    ObjectId = mongoose.Types.ObjectId


/* POST /configuration */
/* Create a new configuration */
route.post( '/', function( req, res )
{
    var config = new CheckConfig( req.body )

    if ( config.interval == undefined || config.interval == '' || config.interval == 0 )
        config.interval = 60

    config.save( function( err )
    {
        if ( err ) console.log( err )

        intervalsHelper.handleRecurrentCheckConfiguration( req, config )

        res.redirect( '/configurations/'+ config._id )
    })
})

/* GET /configuration/create */
/* Show form to create new configuration */
route.get( '/create', function( req, res )
{
    res.render( 'uptime-check-create.html' )
})

/* GET /configuration/:id */
/* Show details for configuration with given :id */
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

/* GET /configuration/:id/once */
/* Invokes configuration only once */
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

/* POST /configuration/:id */
/* Update one configuration with given :id VIA FORM */
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
                    
                    res.redirect( '/configuration/'+ req.params['cid'] )
                })
            })
})

/* PUT /configuration/:id */
/* Update one configuration with given :id VIA AJAX */
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

/* GET /configuration/:id/assumptions */
/* Returns details about the executed Assumptions of a configuration */
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