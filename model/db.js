//comment
var mongoose = require( 'mongoose' );
mongoose.Promise = global.Promise;

if ( process.env.NODE_ENV == 'production' )
    mongoose.connect( 'mongodb://'+ process.env.MONGODB_PORT_27017_TCP_ADDR + ':' + process.env.MONGODB_PORT_27017_TCP_PORT +'/uptime-checks' )
else 
    mongoose.connect( 'mongodb://localhost:27017/uptime-checks' );