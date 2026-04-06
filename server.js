const mongoose = require('mongoose');
const express = require('express');
const app = express();
const PORT = 3000;
app.use(express.json());
const articleRouter = require('./routes/articles')
const commentRouter = require('./routes/comments')
const likeRouter = require('./routes/likes')
const collectRouter = require('./routes/collects')
const userRouter = require('./routes/users')
const me = require('./routes/me')
app.use('/', articleRouter)
app.use('/', commentRouter)
app.use('/', likeRouter)
app.use('/', collectRouter)
app.use('/', userRouter)
app.use('/', me)
app.use('/uploads', express.static('uploads'))
    //连接数据库
mongoose.connect('mongodb://localhost:27017/myblog')
    .then(() => console.log('MongDb连接成功')).catch((err) => console.error('MongDb连接失败', err))
app.listen(PORT, () => {
    console.log('服务器已启动，监听端口' + PORT)
})