const errorHandler = (error, request, response, next) => {
  console.error(error)
  next(error)
}

module.exports = errorHandler
