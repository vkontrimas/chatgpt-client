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
const LOGIN_TOKEN_SECRET = required('HUDDLE_LOGIN_TOKEN_SECRET')
const DB_LOG = process.env.HUDDLE_DB_LOG || false
const PASSWORD_HASH_ROUNDS = 10
const DB_CONFIG = {
  production: {
    url: process.env.DATABASE_URL,
    logging: DB_LOG ? console.log : null,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      }
    },
  },
  development: {
    url: 'postgres://huddle:huddle@localhost:3003/huddle_development',
    logging: DB_LOG ? console.log : null,
  },
  test: {
    url: 'postgres://huddle:huddle@localhost:3003/huddle_test',
    logging: DB_LOG ? console.log : null,
    pool: {
      idle: 1000,
    },
  }
}

const getDBConfig = () => DB_CONFIG[ENVIRONMENT]

module.exports = {
  PORT,
  ENVIRONMENT,
  OPENAI_API_KEY,
  OPENAI_FAKE_MESSAGES,
  PASSWORD_HASH_ROUNDS,
  LOGIN_TOKEN_SECRET,
  getDBConfig,
}
