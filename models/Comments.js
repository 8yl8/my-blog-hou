const mongoose = require('mongoose')
const commentSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    content: String,
    like: Number,
    parent_id: String,
    time: Number,
    article_id: String,
    user_id: String
})
module.exports = mongoose.model('Comment', commentSchema)