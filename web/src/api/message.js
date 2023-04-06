import axios from 'axios'

const baseUrl = 'http://localhost:3000/api/message'

export const getAllMessages = async () => {
  const response = await axios.get(baseUrl)
  return response.data
}

export const createMessage = async (message) => {
  const response = await axios.post(baseUrl, message)
  return response.data
}

