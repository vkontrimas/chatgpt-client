require('dotenv').config()

const PORT = process.env.PORT || 3000
const ENVIRONMENT = process.env.NODE_ENV || "development"
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

module.exports = {
  PORT,
  ENVIRONMENT,
  OPENAI_API_KEY,
}
