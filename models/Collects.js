const mongoose = require('mongoose')
const collectSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    target_id: String,
    user_id: String
})
module.exports = mongoose.model('collect', collectSchema)