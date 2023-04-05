const express = require('express')
require('express-async-errors')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

module.exports = app
