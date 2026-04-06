const Comment = require('../models/Comments')
const User = require('../models/Users')
const router = require('express').Router()
const auth = require('../middleware/auth')
router.get('/comments/:article_id', async(req, res) => {
    const comments = await Comment.find({ article_id: req.params.article_id })
    if (!comments) return res.status(404).json('没有评论')
    const commentsWithUser = await Promise.all(comments.map(async(comment) => {
        const user = await User.findOne({ id: comment.user_id })
        return {
            ...comment._doc,
            nickname: user ? user.nickname : '用户已注销',
            avatar: user ? user.avatar : ''
        }
    }))
    res.json(tree(commentsWithUser))
})
router.post('/comments', auth, async(req, res) => {
    const newComment = new Comment({
        id: Date.now() + '-' + Math.random().toString(36).substring(2, 11),
        ...req.body
    })
    await newComment.save()
    res.status(201).json('评论成功')
})
router.delete('/comments/:id', auth, async(req, res) => {
    const comment = await Comment.findOneAndDelete({ id: req.params.id })
    if (!comment) return res.status(404).json('没有该评论')
    res.json('评论删除成功')
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