const uuid = require('uuid')

const keyToBase64 = (id) => {
  try {
    return Buffer.from(uuid.parse(id)).toString('base64url')
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Invalid UUID') {
      throw 'invalid key'
    }
    throw error
  }
}
const keyFromBase64 = (base64) => {
  try {
    return uuid.stringify(Buffer.from(base64, 'base64url'))
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Stringified UUID is invalid') {
      throw 'invalid base64 id'
    }
    throw error
  }
}

module.exports = { keyToBase64, keyFromBase64 }

