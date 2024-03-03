require('dotenv').config()
const http = require('http')
const express = require('express')
const app = express()
const server = http.createServer(app)
const cookieParser = require('cookie-parser')
const cors = require('cors')
const logger = require('./middlewares/logger')
const mongoose = require('mongoose')
const redis = require('redis')
const handleAccounts = require('./routes/handleAccounts.js')
const handleCsv = require('./routes/handleCsv.js')
const rateLimit = require('express-rate-limit')
const limiter = rateLimit({ windowMs: 60 * 1000, max: 150, keyGenerator: (req) => req.ip })
const mongoURI = `mongodb+srv://homeric:${process.env.mongo}@cluster0.gclzigv.mongodb.net/production?retryWrites=true&w=majority`
const redisName = process.env.redisName
const redisPassword = process.env.redisPassword
let client = null
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' ?
    ["https://example.com"] :
    ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}

async function connectDBs() {
  mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to mongoDB"))
    .catch((err) => console.log(err))
  try {
    client = redis.createClient({ url: `redis://${redisName}:${redisPassword}@redis-15102.c300.eu-central-1-1.ec2.cloud.redislabs.com:15102` })
    await client.connect()
    console.log('connected to Redis')
  }
  catch (err) {
    console.log(err)
  }
}

connectDBs()

app.set('view engine', 'ejs')
app.use(cors(corsOptions))
app.use(limiter)
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cookieParser())
app.use(logger)
app.use('/handle-account', handleAccounts)
app.use('/handle-csv', handleCsv)
app.get('/test', (req, res) => {
  res.json('hello')
})

app.use((req, res) => {
  return res.status(404).json({ error: 'could not find asset' })
})

const port = process.env.PORT || 3030
server.listen(port, () => {
  console.log(`Server started on port ${port}`)
})