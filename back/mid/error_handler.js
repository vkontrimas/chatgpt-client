const errorHandler = (error, request, response, next) => {
  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'unauthorized' })
  }
  console.error(error)
  next(error)
}

module.exports = errorHandler
