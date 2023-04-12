const express = require('express')
require('express-async-errors')
const unknownEndpoint = require('./mid/unknown_endpoint')
const errorHandler = require('./mid/error_handler')
const userToken = require('./mid/userToken')
const messageRouter = require('./api/message')
const usersRouter = require('./api/users')
const loginRouter = require('./api/login')
const registerRouter = require('./api/register')
const { ENVIRONMENT } = require('./config')

const app = express()
if (ENVIRONMENT !== 'test') {
  const morgan = require('morgan')
  app.use(morgan('tiny'))
}
if (ENVIRONMENT === 'development' || environment === 'test') {
  const cors = require('cors')
  app.use(cors())
}
app.use(express.json())
app.use('/api/message', userToken, messageRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/register', registerRouter)
app.use(unknownEndpoint)
app.use(errorHandler)
module.exports = app
