var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var fs = require( 'fs' );
var mkdirp = require( 'mkdirp' );
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require( 'mongoose' );
var nunjucks = require( 'nunjucks' );
var dateFilter = require( 'nunjucks-date-filter' );

// db and entitytypes
var db = require( './model/db' );
var order = require( './model/check' );
var intervalsHelper = require( './helpers/intervalsHelper' );

// routes
var index = require('./routes/index');
var desk = require('./routes/desk');
var users = require('./routes/users');
var checks = require( './routes/checks' );

var app = express();
var io = require( 'socket.io' ).listen( app.listen( 3000 ) )

// view engine setup
// Nunjucks setup
var env = nunjucks.configure( 'views', {
    autoescape: true,
    express: app,
    watch: true,
    tags: {
        blockStart: '<@',
        blockEnd: '@>',
        variableStart: '{{',
        variableEnd: '}}',
        commentStart: '{{--',
        commentEnd: '--}}'
      }
}); 
env.addFilter( 'date', dateFilter );
app.set('view engine', 'nunjucks');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

mkdirp( 'logs', function( err )
{
  // create a write stream (in append mode)
  var accessLogStream = fs.createWriteStream( path.join(__dirname, 'logs', 'access.log'), { flags: 'a'} )

  app.use(logger(':method :url :status :response-time ms, :remote-addr', 
  {
      stream: accessLogStream,
      skip: function (req, res) { return res.statusCode == 304 }
  }));
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// make io accessible to routes
app.use( function( req, res, next )
{
    req.io = io;
    next();
});

// make hashmap accessible to routes
app.use( function( req, res, next ) 
{
    req.intervalsMap = intervalsHelper.intervalsMap;
    next();
})
// make hashmap accessible in templates
app.set( 'intervalsMap', intervalsHelper.intervalsMap )

// init active CheckConfigs in database
mongoose.connection.once( 'open', function()
{
    var CheckConfig = mongoose.model( 'CheckConfig' )

    CheckConfig.update( { active: true }, { '$set': { active: false } }, function( err )
    {
        if( err ) console.log( err )
    })
})

// Routes setup
app.use( '/', index );
app.use( '/desk', desk );
app.use( '/users', users );
app.use( '/uptime-checks', checks );

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
