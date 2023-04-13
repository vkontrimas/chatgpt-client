const { verifySessionToken } = require('../users')

const userSession = (request, response, next) => {
  const authorization = request.get('authorization')
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw 'missing bearer token'
  }

  request.verifyUserSession = async () => {
    const token = authorization.replace('Bearer ', '')
    return await verifySessionToken(token)
  }

  next()
}

module.exports = userSession
