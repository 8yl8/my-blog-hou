const mongoose = require('mongoose')
const collectSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    target_id: String,
    user_id: String
})
collectSchema.index({ target_id: 1, user_id: 1 }, { unique: true })
module.exports = mongoose.model('collect', collectSchema)