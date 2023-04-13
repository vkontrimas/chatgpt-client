const fs = require('fs');

module.exports = {
  development: {
    username: 'postgres',
    password: 'huddle',
    database: 'huddle_dev',
    host: 'localhost',
    port: 3003,
    dialect: 'postgres',
  },
  test: {
    username: 'postgres',
    password: 'huddle',
    database: 'huddle_test',
    host: 'localhost',
    port: 3003,
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
