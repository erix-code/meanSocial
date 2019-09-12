let mongoose = require('mongoose');
let schema = mongoose.Schema;

let MessageSchema = schema({
    text: String,
    created_at:String,
    emitter:{type: schema.ObjectID, ref:'User'},
    receiver:{type: schema.ObjectID, ref:'User'}
});

module.exports = MessageSchema('Message',MessageSchema);