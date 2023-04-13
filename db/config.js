const fs = require('fs');

module.exports = {
  development: {
    username: 'huddle',
    password: 'huddle',
    database: 'huddle_dev',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
  },
  test: {
    username: 'huddle',
    password: 'huddle',
    database: 'huddle_test',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
  },
  production: {
    username: process.env.PROD_DB_USERNAME,
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOSTNAME,
    port: process.env.PROD_DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      }
    }
  }
}
