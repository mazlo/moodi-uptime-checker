var mongoose = require('mongoose'),
    request = require( 'request' ),
    io = require( 'socket.io' ),
    cheerio = require( 'cheerio' ),

    CheckConfig = mongoose.model( 'CheckConfig' ),
    Check = mongoose.model( 'Check' ),
    AssumptionExecuted = mongoose.model( 'AssumptionExecuted' ),
    ObjectId = mongoose.Types.ObjectId;

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
        if ( err ) console.log( err )

        // save status code and time first
        config.last_response = response.statusCode
        config.last_duration = Date.now() - when
    
        // save response as Check
        var check = new Check()

        check.statusCode = config.last_response
        check.duration = config.last_duration
        check.when = when
        check.response = body

        // evaluate assumptions if there are any
        if ( config.assumptions && config.assumptions.length > 0 && config.last_response != 500 )
        {
            // associate with the calling CheckConfig
            check._checkconfig = ObjectId( config._id )

            // load the parsing model
            $ = cheerio.load(body)

            check.markModified( 'assumptions' )

            // prove each assumption and save it in the Check
            for( let obj of config.assumptions )
            {
                var value_returned = eval(obj.value)

                var assumption = Object.assign( new AssumptionExecuted(), obj )
                assumption._id = ObjectId()
                assumption.value_returned = value_returned

                if ( value_returned == obj.value_expected )
                    assumption.succeed = true
                else
                    assumption.succeed = false

                check.assumptions.push( assumption )
            }
        }

        // save Check and push check._id to CheckConfig
        check.save( function( err )
        {
            if ( err ) console.log( err )

            config.checks.push( check )

            config.save( function( err )
            {
                console.log( 'SAVE check in: '+ config._id )
                req.io.sockets.emit( 'check response', config );
            })
        })
        
    })
}