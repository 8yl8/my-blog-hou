const like = require('../models/Likes')
const article = require('../models/Articles')
const router = require('express').Router()
const Comment = require('../models/Comments')
const auth = require('../middleware/auth')
router.post('/', auth, async(req, res) => {
    const haslike = await like.findOne({ target_id: req.body.target_id, user_id: req.user.id, like_target: req.body.like_target })
    let likenum
    if (haslike) {
        await like.findOneAndDelete({ target_id: req.body.target_id, user_id: req.user.id })
        likenum = await like.countDocuments({ target_id: req.body.target_id })
        if (req.body.like_target === 'article') {
            await article.findOneAndUpdate({ id: req.body.target_id }, { like: likenum })
        } else {
            await Comment.findOneAndUpdate({ id: req.body.target_id }, { like: likenum })
        }
        return res.status(200).json({ message: '取消点赞成功' })
    }
    const newlike = new like({
        id: Date.now() + '-' + Math.random().toString(36).substring(2, 11),
        ...req.body,
        user_id: req.user.id
    })
    await newlike.save()

    likenum = await like.countDocuments({ target_id: req.body.target_id, like_target: req.body.like_target })
    if (req.body.like_target === 'article') {
        await article.findOneAndUpdate({ id: req.body.target_id }, { like: likenum })
    } else {
        await Comment.findOneAndUpdate({ id: req.body.target_id }, { like: likenum })
    }
    res.status(201).json({ message: '点赞成功' })
})

router.get('/', auth, async(req, res) => {
    const likes = await like.find({ user_id: req.user.id })
    res.status(200).json(likes)
})
module.exports = router