let mongoose = require('mongoose');
let schema = mongoose.Schema;

let FollowSchema = schema({
    user: {type:schema.ObjectId,ref:'User'},
    followed: {type:schema.ObjectId,ref:'User'},
});

module.exports = mongoose.model('Follow',FollowSchema);