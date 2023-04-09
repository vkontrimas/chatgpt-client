const express = require('express')
require('express-async-errors')
const cors = require('cors')
const unknownEndpoint = require('./mid/unknown_endpoint')
const errorHandler = require('./mid/error_handler')
const messageRouter = require('./api/message')
const usersRouter = require('./api/users')

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/message', messageRouter)
app.use('/api/users', usersRouter)
app.use(unknownEndpoint)
app.use(errorHandler)
module.exports = app
