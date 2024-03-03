const jwt = require('jsonwebtoken')

function auth(req, res, next) {
    if (req.url === '/login' || req.url === '/create-account') return next()
    const authCookie = req.cookies.auth
    const token = authCookie
    if (!token) return res.status(401).json({ message: 'You are not authorized to use this asset' })
    jwt.verify(token, process.env.authCryptKey, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid token' })
        req.userId = decoded.id
        next()
    })
}

module.exports = auth
