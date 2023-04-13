const app = require('./app')
const { PORT } = require('./config')
const { sequelize } = require('./db/db')

sequelize.sync().then(() => {
  app.listen(PORT, () => { console.log(`Server listening on ${PORT}`)})
})
