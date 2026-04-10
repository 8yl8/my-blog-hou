const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors')
const app = express();

app.use(cors())
const PORT = 3001;
app.use(express.json());

const articleRouter = require('./routes/articles')
const commentRouter = require('./routes/comments')
const likeRouter = require('./routes/likes')
const collectRouter = require('./routes/collects')
const userRouter = require('./routes/users')
app.use('/articles', articleRouter)
app.use('/comments', commentRouter)
app.use('/likes', likeRouter)
app.use('/collects', collectRouter)
app.use('/users', userRouter)
app.use('/uploads', express.static('uploads'))
    //连接数据库
const mongoURL = process.env.MONGODB_URL || 'mongodb://localhost:27017/myblog'
mongoose.connect(mongoURL)
    .then(() => console.log('MongDb连接成功')).catch((err) => console.error('MongDb连接失败', err))
app.listen(PORT, () => {
    console.log('服务器已启动，监听端口' + PORT)
})