require('dotenv').config()

const required = (value) => {
  if (!value) {
    throw 'missing configuration value'
  }
  return value
}

const PORT = process.env.PORT || 3000
const ENVIRONMENT = process.env.NODE_ENV || "development"
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_FAKE_MESSAGES = process.env.OPENAI_FAKE_MESSAGES
const LOGIN_TOKEN_SECRET = required(process.env.LOGIN_TOKEN_SECRET)

const PASSWORD_HASH_ROUNDS = 10

module.exports = {
  PORT,
  ENVIRONMENT,
  OPENAI_API_KEY,
  OPENAI_FAKE_MESSAGES,
  PASSWORD_HASH_ROUNDS,
  LOGIN_TOKEN_SECRET,
}
