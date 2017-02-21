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
    _checkconfig: { type: Schema.Types.ObjectId, ref: 'CheckConfig' },
    when: Number,
    duration: Number,
    response: String,
    statusCode: Number,
    assumptions: [assumptionSchema]
})

var checkConfigSchema = new Schema({
    _id: Schema.Types.ObjectId,
    active: { type: Boolean, default: false },
    group_name: String,
    name: String,
    
    url: String,
    data: String,
    interval: { type: Number, default: 60 },
    
    checks: [{ type: Schema.Types.ObjectId, ref: 'Check' }],
    last_response: Number,
    last_duration: Number,

    assumptions: [assumptionSchema]
})

mongoose.model( 'Check', checkSchema );
mongoose.model( 'Assumption', assumptionSchema );
mongoose.model( 'AssumptionExecuted', assumptionSchema );
mongoose.model( 'CheckConfig', checkConfigSchema );