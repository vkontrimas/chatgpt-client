const express = require('express')
require('express-async-errors')
const unknownEndpoint = require('./mid/unknown_endpoint')
const errorHandler = require('./mid/error_handler')
const usersRouter = require('./api/users')
const loginRouter = require('./api/login')
const chatRouter = require('./api/chat')
const registerRouter = require('./api/register')
const waitlistRouter = require('./api/waitlist')
const userSession = require('./mid/user_session')
const { ENVIRONMENT } = require('./config')
const path = require('path')

const app = express()
if (ENVIRONMENT !== 'test') {
  const morgan = require('morgan')
  app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms ":referrer" ":user-agent"'))
}
if (ENVIRONMENT === 'development' || ENVIRONMENT === 'test') {
  const cors = require('cors')
  app.use(cors())
}
/*app.use(express.static('public'))
app.use(express.json())
app.use('/api/chat', userSession, chatRouter)
app.use('/api/users', userSession, usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/register', registerRouter)
app.use('/api/waitlist', waitlistRouter)
app.get('*', (request, response) => response.sendFile(path.resolve('public', 'index.html')))
app.use(unknownEndpoint)
app.use(errorHandler)
*/
app.use((request, response) => {
  response.status(404).end()
})
module.exports = app
