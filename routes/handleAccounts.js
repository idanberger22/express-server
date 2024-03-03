const express = require('express')
const router = express.Router()
const Account = require('../data/accountInfo.js')
const jwt = require('jsonwebtoken')
const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.passwordCryptKey)
const auth = require('../middlewares/auth.js')
router.use(auth)

router.post('/create-account', async (req, res) => {
    try {
        const { nickName, password } = req.body
        const accountExists = await Account.findOne({ nickName })
        if (accountExists) return res.status(400).send('User already exists')
        const account = new Account({
            nickName,
            password: cryptr.encrypt(password)
        })
        const token = jwt.sign({ id: account._id }, process.env.authCryptKey)
        await account.save()
        res.setHeader('Set-Cookie', `auth=${token};samesite=Lax;secure=true;path=/;`)
        return res.json(account)
    }
    catch (err) {
        console.log('error creating user', err)
        return res.status(500).send('Something when wrong')
    }
})

router.post('/login', async (req, res) => {
    const account = await Account.findOne({ nickName: req.body.nickName })
    if (!account) return res.status(404).send('User not found')
    const password = String(JSON.parse(cryptr.decrypt(account.password)))
    if (password !== req.body.password) return res.status(401).send('Invalid password')
    const token = jwt.sign({ id: account._id }, process.env.authCryptKey)
    res.setHeader('Set-Cookie', `auth=${token};samesite=none;secure=true;path=/;`)
    return res.json(token)
})

router.get('/get-purchases', async (req, res) => {
    try {
        const purchases = await Account.findById(req.userId).select('purchases')
        return res.json(purchases)
    }
    catch (err) {
        return res.status(500).send('could not get purchases')
    }
})

module.exports = router