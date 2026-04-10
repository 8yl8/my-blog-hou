const User = require('../models/Users')
const jwt = require('jsonwebtoken')
const router = require('express').Router()
const SECRET = 'my-blog-y-l-screte'
const auth = require('../middleware/auth')
const multer = require('multer')
const upload = multer({ dest: 'uploads/avatars' })
router.post('/login', async(req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({
        username: username,
        password: password
    })
    if (!user) return res.status(404).json('该用户不存在')
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' })
    res.json({
        message: '登录成功',
        token: token,
        user: user
    })
})
router.get('/', auth, async(req, res) => {
    const user = await User.findOne({ id: req.user.id })
    if (!user) return res.status(404).json({ message: '用户不存在' })
    const { password, ...userWithoutPassword } = user.toObject()

    res.json({...userWithoutPassword })
})
router.get('/:id', async(req, res) => {
    const user = await User.findOne({ id: req.params.id })
    if (!user) return res.status(404).json({ message: '用户不存在' })
    const { password, ...userWithoutPassword } = user.toObject()
    res.json(userWithoutPassword)
})
router.post('/register', async(req, res) => {
    const { username, password } = req.body
    const hasuser = await User.findOne({ username: username })
    if (hasuser) return res.status(400).json({ message: '用户名已存在' })
    const newuser = new User({
        id: Date.now() + '-' + Math.random().toString(36).substring(2, 11),
        username: username,
        password: password,
        userIntro: '该用户还没有自我介绍',
        fans: 0,
        like: 0,
        nickname: '新用户',
        avatar: '/uploads/avatars/1.jpg',
    })
    await newuser.save()
    res.status(201).json({ message: '注册成功' })
})
router.patch('/', auth, async(req, res) => {
    const user = await User.findOneAndUpdate({ id: req.user.id }, req.body, { returnDocument: 'after' })
    if (!user) return res.status(404).json({ message: '用户不存在' })
    const { password, ...userWithoutPassword } = user.toObject()
    res.json(userWithoutPassword)
})
router.delete('/', auth, async(req, res) => {
    const user = await User.findOneAndDelete({ id: req.user.id })
    if (!user) return res.status(404).json({ message: '用户不存在' })
    res.json({ message: '用户删除成功' })
})
router.post('/avatar', auth, upload.single('avatar'), async(req, res) => {
    if (!req.file) return res.status(400).json({ message: '上传错误' })
    const Types = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    if (!Types.includes(req.file.mimetype)) {
        return res.status(400).json({ message: '只能上传 JPG/PNG/WEBP 图片' })
    }
    if (req.file.size > 5 * 1024 * 1024) {
        return res.status(400).json({ message: '图片大小不能超过5MB' })
    }
    const url = `/uploads/avatars/${req.file.filename}`
    const user = await User.findOneAndUpdate({ id: req.user.id }, { avatar: url }, { returnDocument: 'after' })
    const { password, ...userWithoutPassword } = user.toObject()
    return res.json({ message: '头像上传成功', user: {...userWithoutPassword, avatar: url } })
})
module.exports = router