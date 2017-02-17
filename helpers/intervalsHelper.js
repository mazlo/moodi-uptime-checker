var mongoose = require('mongoose'),
    CheckConfig = mongoose.model( 'CheckConfig' ),
    Check = mongoose.model( 'Check' ),
    AssumptionExecuted = mongoose.model( 'AssumptionExecuted' ),
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

        // evaluate assumptions if any
        if ( config.assumptions && config.assumptions.length > 0 && config.last_response != 500 )
        {
            check.markModified( 'assumptions' )

            $ = cheerio.load(body)

            for( let obj of config.assumptions )
            {
                var value_returned = eval(obj.value)

                if ( value_returned == obj.value_expected )
                    check.assumptions.push( new AssumptionExecuted({ assumption: obj._id, succeed: true }) )
                else
                    check.assumptions.push( new AssumptionExecuted({ assumption: obj._id, succeed: false, value_returned: value_returned }) )
            }
        }

        console.log( check )

        config.checks.push( check )
        config.save( function( err )
        {
            if ( err ) console.log( err )

            console.log( 'SAVE check in: '+ config._id )
            req.io.sockets.emit( 'check response', config );
        })
    })
}