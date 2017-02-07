var mongoose = require( 'mongoose' ),
    Schema = mongoose.Schema

var checkSchema = new Schema({
    when: Number,
    duration: Number,
    response: String,
    statusCode: Number
})

var checkConfigSchema = new Schema({
    active: { type: Boolean, default: false },
    group_name: String,
    name: String,
    
    url: String,
    data: String,
    interval: { type: Number, default: 60 },
    
    checks: [checkSchema],
    last_response: Number,
    last_duration: Number
})

mongoose.model( 'Check', checkSchema );
mongoose.model( 'CheckConfig', checkConfigSchema );