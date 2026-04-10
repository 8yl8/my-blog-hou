const collect = require('../models/Collects')
const article = require('../models/Articles')
const auth = require('../middleware/auth')
const router = require('express').Router()
router.post('/', auth, async(req, res) => {
    const hascollect = await collect.findOne({ target_id: req.body.target_id, user_id: req.user.id })
    let collectnum
    if (hascollect) {
        await collect.findOneAndDelete({ target_id: req.body.target_id, user_id: req.user.id })
        collectnum = await collect.countDocuments({ target_id: req.body.target_id })
        await article.findOneAndUpdate({ id: req.body.target_id }, { collect: collectnum })
        return res.status(200).json({ message: '取消收藏成功' })
    }
    const newcollect = new collect({
        id: Date.now() + '-' + Math.random().toString(36).substring(2, 11),
        ...req.body,
        user_id: req.user.id
    })
    await newcollect.save()
    collectnum = await collect.countDocuments({ target_id: req.body.target_id })
    await article.findOneAndUpdate({ id: req.body.target_id }, { collect: collectnum })
    return res.status(201).json({ message: '收藏成功' })
})
router.get('/', auth, async(req, res) => {
    const collects = await collect.find({ user_id: req.user.id })
    res.status(200).json(collects)
})
module.exports = router