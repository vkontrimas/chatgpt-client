const errorHandler = (error, request, response, next) => {
  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'unauthorized' })
  }
  if (typeof error === 'string') {
    switch (error) {
    case 'no name':
      return response.status(400).json({ error: 'no name' })
    case 'no email':
      return response.status(400).json({ error: 'no email' })
    case 'email collision':
      return response.status(400).json({ error: 'email in use' })
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
