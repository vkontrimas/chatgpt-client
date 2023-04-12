const supertest = require('supertest')
const api = supertest(require('../../app'))

const { initializeDB, wipeDB } = require('../db_helper')

const ENDPOINT = '/register'

describe(`API ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await wipeDB()
    await initializeDB()
  })

  test('temp', async () => {})
})
