var express = require('express'),
    route = express.Router();

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

/* POST /uptime-checks */
/* Create a new CheckConfig */
route.post( '/', function( req, res )
{
    var config = new CheckConfig( req.body )

    // save next execution in config to show in ui
    config.next_check = Date.now() + req.body.interval

    config.save( function( err )
    {
        if ( err ) console.log( err )

        handleRecurrentCheckConfiguration( req, config )

        res.redirect( '/uptime-checks' )
    })
})

/* */
function handleRecurrentCheckConfiguration( req, config )
{
    var intervalsMap = req.intervalsMap

    // remove recurrent task first
    if ( intervalsMap[config._id] )
    {
        var interval = intervalsMap[config._id]

        clearInterval( interval )
        intervalsMap[config._id] = undefined

        console.log( 'CLEARED interval: '+ interval )
    }

    // nothing to do
    if ( !config.active )
        return

    // add recurrent task 
    var interval = setInterval( function()
    {
        //      trigger HEAD request to config.url with config.data
        //      save result as config.checks[{}] object
        console.log( 'EXEC interval:'+ this )
        console.log( 'HEAD '+ config.url )

    }, config.interval )

    // save in map
    intervalsMap[config._id] = interval
    console.log( 'SET interval: '+ interval )
}

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
            { new : true },
            function( err, config ) 
            {
                if ( err ) console.log( err )
                if ( config == undefined ) res.json( { status: 500 } )

                config.save( function( err )
                {
                    handleRecurrentCheckConfiguration( req, config )
                    
                    res.redirect( '/uptime-checks' )
                })
            })
})

module.exports = route;