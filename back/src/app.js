const express = require('express')
require('express-async-errors')
const cors = require('cors')
const unknownEndpoint = require('./mid/unknown_endpoint')
const messageRouter = require('./routes/message')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/message', messageRouter)
app.use(unknownEndpoint)

module.exports = app