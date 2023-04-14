const uuid = require('uuid')

const fromUUID = (id) => Buffer.from(uuid.parse(id)).toString('base64url')
const toUUID = (base64) => uuid.stringify(Buffer.from(base64, 'base64url'))

module.exports = { fromUUID, toUUID }

