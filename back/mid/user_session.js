const { verifySessionToken } = require('../users')

const userSession = (request, response, next) => {
  const authorization = request.get('authorization')

  request.verifyUserSession = async () => {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw 'missing bearer token'
    }

    const token = authorization.replace('Bearer ', '')
    return await verifySessionToken(token)
  }

  next()
}

module.exports = userSession
