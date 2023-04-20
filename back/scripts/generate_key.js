const { randomBytes } = require('crypto')
const buf = randomBytes(24)
console.log(buf.toString('base64url'))

