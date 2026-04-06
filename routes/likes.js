const like = require('../models/Likes')
const article = require('../models/Articles')
const router = require('express').Router()
const auth = require('../middleware/auth')
router.post('/likes', auth, async(req, res) => {
    const haslike = await like.findOne({ target_id: req.body.target_id, user_id: req.body.user_id })
    let likenum
    if (haslike) {
        await like.findOneAndDelete({ target_id: req.body.target_id, user_id: req.body.user_id })
        likenum = await like.countDocuments({ target_id: req.body.target_id })
        await article.findOneAndUpdate({ id: req.body.target_id }, { like: likenum })
        return res.status(200).json('取消点赞成功')
    }
    const newlike = new like({
        id: Date.now() + '-' + Math.random().toString(36).substring(2, 11),
        ...req.body
    })
    await newlike.save()
    likenum = await like.countDocuments({ target_id: req.body.target_id })
    await article.findOneAndUpdate({ id: req.body.target_id }, { like: likenum })
    res.status(201).json('点赞成功')
})
router('/likes/:user_id', auth, async(req, res) => {
    const likes = await like.find({ user_id: req.params.user_id })
    res.status(200).json(likes)
})
module.exports = router