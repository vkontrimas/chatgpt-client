const errorHandler = (error, request, response, next) => {
  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'unauthorized' })
  }
  if (typeof error === 'string') {
    switch (error) {
    case 'no email':
      return response.status(400).json({ error: 'no email' })
    case 'no password':
      return response.status(400).json({ error: 'no password' })
    case 'user not found':
    case 'wrong password': 
      return response.status(401).json({ error: 'unauthorized' })
    default:
        break;
    }
  }
  console.error(error)
  next(error)
}

module.exports = errorHandler
