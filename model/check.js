var mongoose = require( 'mongoose' ),
    Schema = mongoose.Schema

var assumptionSchema = new Schema({
    label: String,
    type: String,
    value: String,
    value_expected: String,
    value_returned: String,
    succeed: Boolean
})

var checkSchema = new Schema({
    when: Number,
    duration: Number,
    response: String,
    statusCode: Number,
    assumptions: [assumptionSchema]
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
    last_duration: Number,

    assumptions: [assumptionSchema]
})

mongoose.model( 'Check', checkSchema );
mongoose.model( 'Assumption', assumptionSchema );
mongoose.model( 'AssumptionExecuted', assumptionSchema );
mongoose.model( 'CheckConfig', checkConfigSchema );