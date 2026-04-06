const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    nickname: String,
    password: { type: String, required: true },
    userIntro: String,
    fans: Number,
    like: Number,
    avatar: String
})
module.exports = mongoose.model('User', userSchema)