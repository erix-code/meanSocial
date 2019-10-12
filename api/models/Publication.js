let mongoose = require('mongoose');
let schema = mongoose.Schema;

let PublicationSchema = schema({
    text: String,
    file: String,
    created_at: String,
    user: { type:schema.ObjectId,ref:'User'}
});

module.exports = mongoose.model('Publication',PublicationSchema);
