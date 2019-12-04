//comment
var mongoose = require( 'mongoose' );
    mongoose.Promise = global.Promise;

var env     = process.env.NODE_ENV || 'development'
var config  = require( './../config.js' )[env];

mongoose.connect( config.MONGODB_URI, { useMongoClient: true } );