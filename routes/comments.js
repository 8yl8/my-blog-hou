const Comment = require('../models/Comments')
const User = require('../models/Users')
const router = require('express').Router()
const Likes = require('../models/Likes')
const auth = require('../middleware/auth')
router.get('/:article_id', async(req, res) => {
    const comments = await Comment.find({ article_id: req.params.article_id })
    if (comments.length === 0) return res.json([])
    const commentsWithUser = await Promise.all(comments.map(async(comment) => {
        const user = await User.findOne({ id: comment.user_id })
        return {
            ...comment._doc,
            nickname: user ? user.nickname : '用户已注销',
            avatar: user ? user.avatar : '',
            isuser: false
        }
    }))
    res.json(tree(commentsWithUser))
})
router.get('/me/:article_id', auth, async(req, res) => {
    const comments = await Comment.find({ article_id: req.params.article_id })
    if (comments.length === 0) return res.json([])
    const commentsId = comments.map(c => c.id)
    const likes = await Likes.find({ user_id: req.user.id, like_target: 'comment', target_id: { $in: commentsId } })
    const user_id = [...new Set(comments.map(c => c.user_id))]
    const user = await User.find({ id: { $in: user_id } })
    const userMap = {}
    user.forEach(u => {
        userMap[u.id] = u
    })
    const commentsWithUser = comments.map(comment => {
        const user = userMap[comment.user_id]
        return {
            ...comment._doc,
            nickname: user ? user.nickname : '用户已注销',
            avatar: user ? user.avatar : '',
            isuser: user && user.id === req.user.id ? true : false,
            islike: likes.some(like => like.target_id === comment.id) ? true : false
        }
    })
    res.json(tree(commentsWithUser))
})
router.post('/', auth, async(req, res) => {
    const newComment = new Comment({
        id: Date.now() + '-' + Math.random().toString(36).substring(2, 11),
        ...req.body,
        user_id: req.user.id,
        like: 0,
        time: Date.now()
    })
    await newComment.save()
    res.status(201).json({ message: '评论成功' })
})
router.delete('/:id', auth, async(req, res) => {
    const comment = await Comment.findOneAndDelete({ id: req.params.id })
    if (comment.length === 0) return res.json([])
    res.json({ message: '评论删除成功' })
})

function tree(comments) {
    const map = new Map()
    const roots = []
    for (let item of comments) {
        map.set(item.id, {...item, child: [] })
    }
    for (let item of comments) {
        const node = map.get(item.id)
        if (item.parent_id === null) {
            roots.push(node)
        } else {
            const parent = map.get(item.parent_id)
            if (parent) {
                parent.child.push(node)
            }
        }
    }
    return roots
}
module.exports = router