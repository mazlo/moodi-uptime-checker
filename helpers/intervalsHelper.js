var mongoose = require('mongoose'),
    CheckConfig = mongoose.model( 'CheckConfig' ),
    Check = mongoose.model( 'Check' ),
    request = require( 'request' )

/* */
exports.intervalsMap = {};

/* */
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
    var intervalId = exports.addRecurrentTask( config )

    // save in map
    intervalsMap[config._id] = intervalId
    console.log( 'SET interval: '+ intervalId )
}

/* */
exports.addRecurrentTask = function( config )
{
    var interval = setInterval( function()
    {
        console.log( 'EXEC interval: '+ this )
        console.log( 'HEAD '+ config.url )

        var when = Date.now()

        // trigger HEAD request to config.url with config.data
        request.head({
            url: config.url,
            headers: { 'User-Agent': 'uptime-checker' }
        }, function( err, response, body )
        {
            var now = Date.now()

            // save response as Check
            var check = new Check()

            check.statusCode = response.statusCode

            check.when = when
            check.duration = now - when
            check.response = body

            config.next_check = now + parseInt( config.interval )
            config.last_response = check.statusCode
            config.last_duration = check.duration

            config.markModified( 'checks' )
            config.checks.push( check )

            config.save( function( err )
            {
                if ( err ) console.log( err )

                console.log( 'SAVE check in: '+ config._id )
            })
        })

    }, config.interval )

    return interval
}