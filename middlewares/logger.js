const fs = require('fs')
const path = require('path')
const logFilePath = path.join(__dirname, '../logs.log')
const { promisify } = require('util')
const readFile = promisify(fs.readFile)
const getStats = promisify(fs.stat)
const writeFile = promisify(fs.writeFile)
const avergaeLineSize = 106
let fileSize = 0

async function checkFileSize() {
    try {
        const stats = await getStats(logFilePath)
        fileSize = stats.size || 0
    }
    catch (err) {
        console.error('Error getting file stats:', err)
    }
}
checkFileSize()

const logger = (req, res, next) => {
    const startTime = new Date()
    const writeStream = fs.createWriteStream(logFilePath, { flags: 'a' })

    res.on('finish', async () => {
        try {
            const duration = new Date() - startTime
            const logMessage = `${new Date().toISOString()} | ${req.method} ${req.url} | Status: ${res.statusCode} | Duration: ${duration}ms\n`
            writeStream.write(logMessage, 'utf8', (err) => {
                if (err) console.error('Error writing to logs.txt:', err)
                else fileSize += avergaeLineSize
            })
            if (fileSize > 1_000_000) deleteFirst500Lines() // 1MB
        } catch {
            console.error('Error writing to logs.txt:', err)
        }
    })
    next()
}

async function deleteFirst500Lines() {
    try {
        const data = await readFile(logFilePath, 'utf8')
        const lines = data.split('\n')
        const newLines = lines.slice(500)
        const newData = newLines.join('\n')
        writeFile(logFilePath, newData, 'utf8')
        fileSize = Buffer.byteLength(newData)
    }
    catch (err) {
        console.error('Error truncating file:', err)
    }
}

module.exports = logger