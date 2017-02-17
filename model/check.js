var mongoose = require( 'mongoose' ),
    Schema = mongoose.Schema

var assumptionExecutedSchema = new Schema({
    assumption: { type: Schema.ObjectId, ref: 'Assumption' },
    succeed: Boolean,
    value_returned: String
})

var checkSchema = new Schema({
    when: Number,
    duration: Number,
    response: String,
    statusCode: Number,
    assumptions: [assumptionExecutedSchema]
})

var assumptionSchema = new Schema({
    label: String,
    type: String,
    value: String,
    expected_value: String
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
mongoose.model( 'AssumptionExecuted', assumptionExecutedSchema );
mongoose.model( 'CheckConfig', checkConfigSchema );