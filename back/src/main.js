const app = require('./app')
const { PORT } = require('./config')

const sequelize = require('./db/sequelize')
const User = require('./db/user')

// TODO: remove this when we switch from in-memory
sequelize.sync()

app.listen(PORT, () => { console.log(`Server listening on ${PORT}`)})
