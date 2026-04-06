const Article = require('../models/Articles');
const router = require('express').Router()
const auth = require('../middleware/auth')
const Comment = require('../models/Comments')
const collect = require('../models/Collects')
const like = require('../models/Likes')
router.get('/articles', async(req, res) => {
    const articles = await Article.find();
    res.json(articles);
})
router.get('/articles/:id', async(req, res) => {
    const article = await Article.findOne({ id: req.params.id })
    if (!article) return res.status(404).json({ error: '文章不存在' })
    res.json(article)
})
router.post('/articles', auth, async(req, res) => {
    const newArticle = new Article({
        id: Date.now() + '-' + Math.random().toString(36).substring(2, 11),
        ...req.body,
        user_id: req.user.id
    })
    await newArticle.save()
    res.status(201).json(newArticle)
})
router.patch('/articles/:id', auth, async(req, res) => {
    const article = await Article.findOneAndUpdate({
            id: req.params.id
        },
        req.body, { new: true }
    )
    if (!article) return res.status(404).json({ error: '文章不存在' })
    res.json(article)
})
router.delete('/articles/:id', auth, async(req, res) => {
    const hasarticle = await Article.findOne({ id: req.params.id })
    if (!hasarticle) return res.status(404).json({ error: '文章不存在' })
    if (hasarticle.user_id !== req.user.id) return res.status(403).json({ error: '没有权限删除该文章' })
    await Article.findOneAndDelete({ id: req.params.id })
    await Comment.deleteMany({ target_id: req.params.id })
    await collect.deleteMany({ target_id: req.params.id })
    await like.deleteMany({ target_id: req.params.id })
    res.json({ message: '文章删除成功' })
})
module.exports = router