require('dotenv').config()

const required = (key) => {
  const value = process.env[key]
  if (!value) {
    throw `missing configuration value: ${key}`
  }
  return value
}

const PORT = process.env.PORT || 3000
const ENVIRONMENT = process.env.NODE_ENV || "development"
const OPENAI_API_KEY = process.env.HUDDLE_OPENAI_API_KEY
const OPENAI_FAKE_MESSAGES = process.env.HUDDLE_OPENAI_FAKE_MESSAGES
const SESSION_TOKEN_SECRET = required('HUDDLE_LOGIN_TOKEN_SECRET')
const DB_LOG = process.env.HUDDLE_DB_LOG || false
const PASSWORD_SALT_ROUNDS = 10
const MESSAGE_KEY = required('HUDDLE_MESSAGE_KEY')

const fakeWebhookServerPort = () => {
  switch (ENVIRONMENT) {
    case 'test':
      return 3051
    case 'development':
      return 3052
    default:
      return undefined
  }
}

const WAITLIST_SIGNUP_WEBHOOK = ENVIRONMENT === 'production'
  ? required('HUDDLE_WAITLIST_SIGNUP_WEBHOOK')
  : `http://localhost:${fakeWebhookServerPort()}/test-hook`

const FAKE_WEBHOOK_SERVER_PORT = fakeWebhookServerPort()

module.exports = {
  PORT,
  ENVIRONMENT,
  OPENAI_API_KEY,
  OPENAI_FAKE_MESSAGES,
  PASSWORD_SALT_ROUNDS,
  SESSION_TOKEN_SECRET,
  WAITLIST_SIGNUP_WEBHOOK,
  FAKE_WEBHOOK_SERVER_PORT,
  MESSAGE_KEY,
}
