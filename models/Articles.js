const mongoose = require('mongoose');
const articleSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    user_id: { type: String, required: true },
    title: String,
    desc: String,
    category: String,
    like: { type: Number, default: 0 },
    collect: { type: Number, default: 0 },
    nickname: String,
    cover: String
})
module.exports = mongoose.model('Article', articleSchema)