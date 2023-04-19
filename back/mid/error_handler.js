const errorHandler = (error, request, response, next) => {
  if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({ error: 'unauthorized' })
  }
  if (typeof error === 'string') {
    switch (error) {
      case 'cannot post chat message while completion is running':
      case 'cannot post message after a message with an error':
      case 'cannot complete chat with no messages':
      case 'cannot complete chat while another completion is running':
      case 'cannot complete chat when last message has error':
      case 'cannot delete messages during chat completion':
        return response.status(409).json({ error })
      case 'invalid chat id':
        return response.status(404).json({ error })
      case 'missing bearer token':
      case 'no first name':
      case 'no last name':
      case 'no email':
      case 'no password':
      case 'missing role':
      case 'missing content':
        return response.status(400).json({ error })
      case 'email collision':
        return response.status(400).json({ error: 'email in use' })
      case 'session token invalid':
      case 'user not found':
      case 'wrong password': 
      case 'unauthorized':
        return response.status(401).json({ error: 'unauthorized' })
      default:
        break
    }
  }
  console.error(error)
  next(error)
}

module.exports = errorHandler
