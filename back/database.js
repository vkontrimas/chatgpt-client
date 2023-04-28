const { POSTGRES_PASSWORD } = require('./config')

module.exports = {
  development: {
    username: 'postgres',
    password: POSTGRES_PASSWORD,
    database: 'huddle_dev',
    host: 'database',
    port: 5432,
    dialect: 'postgres',
    logging: process.env.DB_LOG ? console.log : null,
  },
  test: {
    username: 'postgres',
    password: POSTGRES_PASSWORD,
    database: 'huddle_test',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: process.env.DB_LOG ? console.log : null,
  },
  production: {
    username: 'postgres',
    password: POSTGRES_PASSWORD,
    database: 'huddle_prod',
    host: 'database',
    port: 5432,
    dialect: 'postgres',
    logging: process.env.DB_LOG ? console.log : null,
  }
}
