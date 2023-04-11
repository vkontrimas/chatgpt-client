const userToken = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    request.userToken = authorization.replace('Bearer ', '')
  }
  next()
}

module.exports = userToken
