const mongoose = require('mongoose')
const likeSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    like_target: String,
    target_id: String,
    user_id: String
})
module.exports = mongoose.model('like', likeSchema)