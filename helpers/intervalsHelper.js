var mongoose = require('mongoose'),
    CheckConfig = mongoose.model( 'CheckConfig' ),
    Check = mongoose.model( 'Check' ),
    request = require( 'request' ),
    io = require( 'socket.io' ),
    cheerio = require( 'cheerio' )

/* */
exports.intervalsMap = {};

/* Is executed on creation of update of CheckConfig */
exports.handleRecurrentCheckConfiguration = function( req, config )
{
    var intervalsMap = req.intervalsMap

    // remove recurrent task first
    if ( intervalsMap[config._id] )
    {
        var intervalId = intervalsMap[config._id]

        clearInterval( intervalId )
        intervalsMap[config._id] = undefined

        console.log( 'CLEARED interval: '+ intervalId )
    }

    // nothing to do
    if ( !config.active )
        return

    // add recurrent task 
    var intervalId = exports.addRecurrentTask( req, config )

    // save in map
    intervalsMap[config._id] = intervalId
    console.log( 'SET interval: '+ intervalId )
}

/* */
exports.addRecurrentTask = function( req, config )
{
    var interval = setInterval( exports.doTask.bind( this, req, config ), ( config.interval * 1000 ) )

    return interval
}

/* */
exports.doTask = function( req, config )
{
    var url = config.url + (config.data ? '?'+ config.data : '')
    console.log( 'EXEC interval: '+ this )
    console.log( 'GET '+ url )

    var when = Date.now()

    // trigger GET request to config.url with config.data
    request.get({
        url: url,
        headers: { 'User-Agent': 'uptime-checker' }
    }, function( err, response, body )
    {
        // save response as Check
        var check = new Check()

        check.statusCode = response.statusCode

        check.when = when
        check.duration = Date.now() - when
        check.response = body

        config.last_response = check.statusCode
        config.last_duration = check.duration

        config.markModified( 'checks' )
        config.checks.push( check )

        config.save( function( err )
        {
            if ( err ) console.log( err )

            console.log( 'SAVE check in: '+ config._id )
            req.io.sockets.emit( 'check response', config );
        })

        // evaluate assumptions if any

        if ( config.last_response == 500 )
            return

        if ( !config.assumptions || config.assumptions.length == 0 )
            return

        $ = cheerio.load(body)

        for( let obj of config.assumptions )
        {
            if ( eval(obj.value) == obj.expected_value )
                console.log( 'great!' )
            else
                console.log( 'oh no..' )
        }
    })
}