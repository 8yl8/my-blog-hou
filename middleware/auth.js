const jwt = require('jsonwebtoken');

// 你生成 token 时用的密钥，必须和后端一致
const SECRET_KEY = "my-blog-y-l-screte";

const auth = (req, res, next) => {
    try {
        // 拿到前端传来的 token
        const token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : null
        if (!token) return res.status(401).json({ message: "未登录" });

        // 验证 token
        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) return res.status(401).json({ message: "登录已过期" });
            req.user = decoded; // 把用户信息放进请求
            next();
        });
    } catch (err) {
        res.status(401).json({ message: "无效token" });
    }
};

module.exports = auth;