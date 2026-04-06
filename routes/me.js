const auth = require('../middleware/auth')
const router = require('express').Router()
router.get('/me', auth, async(req, res) => {
    res.json({
        id: req.user.id
    })
})
module.exports = router