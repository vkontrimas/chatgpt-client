const supertest = require('supertest')
const api = supertest(require('../../app'))

const ENDPOINT = '/api/users'

const { 
  modelUser,
  initialUsers,
  initializeDB,
  wipeDB,
  fetchAllUsers,
} = require('../db_helper')

describe(`API ${ENDPOINT}`, () => {
  beforeEach(async () => {
    await wipeDB()
    await initializeDB()
  })

  test('placeholder', async () => {
  })
})
