const express = require('express')
require('express-async-errors')
const cors = require('cors')

const PORT = 3000
const app = express()
app.use(cors())
app.use(express.json())
app.listen(PORT, () => { console.log(`Server listening on ${PORT}`)})
