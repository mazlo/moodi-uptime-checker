var mongoose = require( 'mongoose' ),
    Schema = mongoose.Schema

var checkSchema = new Schema({
    when: { type: Date, default: undefined },
    duration: Number,
    response: String,
})

var checkConfigSchema = new Schema({
    active: { type: Boolean, default: false },
    group_name: String,
    name: String,
    
    url: String,
    data: String,
    interval: { type: Number, default: 60000 },
    
    checks: [checkSchema]
})

mongoose.model( 'Check', checkSchema );
mongoose.model( 'CheckConfig', checkConfigSchema );