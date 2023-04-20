const {
  scrypt,
  randomBytes,
  createCipheriv,
  createDecipheriv,
} = require('crypto')
const { Readable } = require('stream')

const algorithm = 'aes-192-cbc'

class MessageCrypto {
  constructor(key) {
    this.key = Buffer.from(key, 'base64url')
  }

  encryptMessage(plaintext) {
    return new Promise((resolve, reject) => {
      if (!plaintext) { reject('missing plaintext') }

      const iv = randomBytes(16)
      const cipher = createCipheriv(algorithm, this.key, iv)
      cipher.setEncoding('base64url')

      let ciphertext = ''
      cipher.on('data', (chunk) => ciphertext += chunk)
      cipher.on('error', (error) => reject(error))
      cipher.on('end', () => resolve({ ciphertext, iv: iv.toString('base64url') }))

      cipher.write(plaintext)
      cipher.end()
    })
  }

  decryptMessage(ciphertext, ivBase64) {
    return new Promise((resolve, reject) => {
      if (!ciphertext) { reject('missing ciphertext') }
      if (!ivBase64) { reject('missing iv') }

      const iv = Buffer.from(ivBase64, 'base64url')
      const decipher = createDecipheriv(algorithm, this.key, iv)
      decipher.setEncoding('utf8')

      let plaintext = ''
      decipher.on('data', (chunk) => plaintext += chunk)
      decipher.on('error', (error) => reject(error))
      decipher.on('end', () => resolve(plaintext))

      decipher.write(ciphertext, 'base64url')
      decipher.end()
    })
  }
}

module.exports = MessageCrypto
