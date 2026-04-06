const collect = require('../models/Collects')
const article = require('../models/Articles')
const auth = require('../middleware/auth')
const router = require('express').Router()
router.post('/collects', auth, async(req, res) => {
    const hascollect = await collect.findOne({ target_id: req.body.target_id, user_id: req.body.user_id })
    let collectnum
    if (hascollect) {
        await collect.findOneAndDelete({ target_id: req.body.target_id, user_id: req.body.user_id })
        collectnum = await collect.countDocuments({ target_id: req.body.target_id })
        await article.findOneAndUpdate({ id: req.body.target_id }, { collect: collectnum })
        return res.status(200).json('取消收藏成功')
    }
    const newcollect = new collect({
        id: Date.now() + '-' + Math.random().toString(36).substring(2, 11),
        ...req.body
    })
    await newcollect.save()
    collectnum = await collect.countDocuments({ target_id: req.body.target_id })
    await article.findOneAndUpdate({ id: req.body.target_id }, { collect: collectnum })
    return res.status(201).json('收藏成功')
})
router.get('/collects/:user_id'), auth, async(req, res) => {
    const user_id = req.params.user_id
    const collects = await collect.find({ user_id: user_id })
    res.status(200).json(collects)
}
module.exports = router