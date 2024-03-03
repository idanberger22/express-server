const express = require('express')
const router = express.Router()
const fs = require('fs')
const { promisify } = require('util')
const readFileAsync = promisify(fs.readFile)
const appendFileAsync = promisify(fs.appendFile)
const rewriteFileAsync = promisify(fs.writeFile)
const path = require('path')
const pathToCsv = path.join(__dirname, '../data/data.csv')
const uuid = require('uuid')

router.get('/get-users', async (req, res) => {
    try {
        const data = await readFileAsync(pathToCsv, 'utf8')
        const lines = data.split('\n').slice(1) // slice to remove the header
        const users = lines.map(line => {
            const [id, nickName, email, age] = line.split(',')
            return { id, nickName, email, age }
        })
        return res.json(users)
    }
    catch (err) {
        console.error('Error getting users:', err)
        return res.status(500).send(err.message)
    }
})

router.post('/add-user', async (req, res) => {
    try {
        const { nickName, age, email } = req.body
        if (!nickName || !age || !email) return res.status(400).json('nickName, age and email are required')
        const id = uuid.v4()
        const newUser = `\n${id},${nickName},${email},${age}`
        await appendFileAsync(pathToCsv, newUser, 'utf8')
        return res.json('New user added successfully')
    }
    catch (err) {
        console.error('Error adding user:', err)
        return res.status(500).send(err.message)
    }
})

router.put('/update-user', async (req, res) => {
    try {
        const { id, change } = req.body // change is an object describing {key-to-change : new-value}
        if (!id || id === 'id') return res.status(400).json('valid id is required') // prevent accessing the header
        const data = await readFileAsync(pathToCsv, 'utf8')
        const lines = data.split('\n')
        const newLines = lines.map(line => formatLineWithChange(line, id, change))
        const newData = newLines.join('\n')
        await rewriteFileAsync(pathToCsv, newData, 'utf8')
        return res.json('user updated successfully')
    }
    catch (err) {
        console.error('Error updating user:', err)
        return res.status(500).send(err.message)
    }
})

function formatLineWithChange(line, id, change) {
    const [userId, name, email, age] = line.split(',')
    if (String(id).replace(/ /g, "") !== String(userId).replace(/ /g, "")) return line
    return `${id},${change.nickName || name},${change.email || email},${change.age || age}`
}

router.delete('/delete-user', async (req, res) => {
    try {
        const { id } = req.body
        if (!id) return res.status(400).json('id is required')
        const data = await readFileAsync(pathToCsv, 'utf8')
        const lines = data.split('\n')
        const newLines = lines.filter(line => !line.startsWith(id))
        const newData = newLines.join('\n')
        await rewriteFileAsync(pathToCsv, newData, 'utf8')
        return res.json('user deleted successfully')
    }
    catch (err) {
        console.error('Error deleting user:', err)
        return res.status(500).send(err.message)
    }
})

module.exports = router