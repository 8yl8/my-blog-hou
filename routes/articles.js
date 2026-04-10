const Article = require('../models/Articles');
const router = require('express').Router()
const auth = require('../middleware/auth')
const Comment = require('../models/Comments')
const collect = require('../models/Collects')
const User = require('../models/Users')
const like = require('../models/Likes')
const multer = require('multer')
const upload = multer({ dest: 'uploads/covers' })
router.get('/', async(req, res) => {
    const articles = await Article.find();
    if (articles.length === 0) return res.status(200).json([])
    res.json(articles);
})
router.get('/my', auth, async(req, res) => {
    const articles = await Article.find({ user_id: req.user.id })
    if (articles.length === 0) return res.status(200).json([])
    res.json(articles)
})
router.get('/:id', async(req, res) => {
    const article = await Article.findOne({ id: req.params.id })
    if (!article) return res.status(404).json({ error: '文章不存在' })
    const isuser = false
    const newarticle = {...article._doc, isuser: isuser }
    res.json(newarticle)
})

router.get('/me/:id', auth, async(req, res) => {
    const article = await Article.findOne({ id: req.params.id })
    const haslike = await like.findOne({ user_id: req.user.id, target_id: req.params.id })
    const hascollect = await collect.findOne({ user_id: req.user.id, target_id: req.params.id })
    if (!article) return res.status(404).json({ error: '文章不存在' })
    const isuser = article.user_id === req.user.id
    const islike = haslike && haslike.user_id === req.user.id
    const iscollect = hascollect && hascollect.user_id === req.user.id
    const newarticle = {...article._doc, isuser: isuser, islike: islike, iscollect: iscollect }
    res.json(newarticle)
})

router.post('/', auth, async(req, res) => {
    const user = await User.findOne({ id: req.user.id })
    const newArticle = new Article({
        id: Date.now() + '-' + Math.random().toString(36).substring(2, 11),
        ...req.body,
        user_id: req.user.id,
        nickname: user.nickname,
    })
    await newArticle.save()
    res.status(201).json(newArticle)
})
router.patch('/:id', auth, async(req, res) => {
    const hasarticle = await Article.findOne({ id: req.params.id })
    if (!hasarticle) return res.status(404).json({ error: '文章不存在' })
    if (hasarticle && hasarticle.user_id !== req.user.id) return res.status(403).json({ error: '没有权限修改该文章' })

    const article = await Article.findOneAndUpdate({
            id: req.params.id
        },
        req.body, { returnDocument: "after" }
    )

    res.json(article)
})
router.delete('/:id', auth, async(req, res) => {
    const hasarticle = await Article.findOne({ id: req.params.id })
    if (!hasarticle) return res.status(404).json({ error: '文章不存在' })
    if (hasarticle.user_id !== req.user.id) return res.status(403).json({ error: '没有权限删除该文章' })
    await Article.findOneAndDelete({ id: req.params.id })
    await Comment.deleteMany({ target_id: req.params.id })
    await collect.deleteMany({ target_id: req.params.id })
    await like.deleteMany({ target_id: req.params.id })
    res.json({ message: '文章删除成功' })
})
router.post('/cover', auth, upload.single('cover'), async(req, res) => {
    if (!req.file) return res.status(400).json({ message: '上传错误' })
    const Types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!Types.includes(req.file.mimetype)) return res.status(400).json({ message: '文件不合法' })
    if (req.file.size > 5 * 1024 * 1024) return res.status(400).json({ message: '文件过大' })
    const url = `/uploads/covers/${req.file.filename}`
    return res.status(201).json({ message: '上传图片成功', cover: url })
})
module.exports = router