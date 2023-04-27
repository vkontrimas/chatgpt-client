const fs = require('fs');

module.exports = {
  development: {
    username: 'postgres',
    password: process.env.HUDDLE_POSTGRES_PASSWORD,
    database: 'huddle_dev',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: process.env.DB_LOG ? console.log : null,
  },
  test: {
    username: 'postgres',
    password: process.env.HUDDLE_POSTGRES_PASSWORD,
    database: 'huddle_test',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: process.env.DB_LOG ? console.log : null,
  },
  production: {
    username: 'postgres',
    password: process.env.HUDDLE_POSTGRES_PASSWORD,
    database: 'huddle_prod',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: process.env.DB_LOG ? console.log : null,
  }
}
