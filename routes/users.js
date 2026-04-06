const User = require('../models/Users')
const jwt = require('jsonwebtoken')
const router = require('express').Router()
const SECRET = 'my-blog-y-l-screte'
const auth = require('../middleware/auth')
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
router.get('/users/:id', async(req, res) => {
    const user = await User.findOne({ id: req.params.id })
    if (!user) return res.status(404).json('用户不存在')
    res.json(user)
})
router.post('/register', async(req, res) => {
    const { username, password } = req.body
    const hasuser = await User.findOne({ username: username })
    if (hasuser) return res.status(400).json('用户名已存在')
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
    res.status(201).json(newuser)
})
router.patch('/users/:id', auth, async(req, res) => {
    const user = await User.findOneAndUpdate({ id: req.params.id }, req.body, { new: true })
    if (!user) return res.status(404).json('用户不存在')
    res.json(user)
})
router.delete('/users/:id', auth, async(req, res) => {
    const user = await User.findOneAndDelete({ id: req.params.id })
    if (!user) return res.status(404).json('用户不存在')
    res.json({ message: '用户删除成功' })
})
module.exports = router