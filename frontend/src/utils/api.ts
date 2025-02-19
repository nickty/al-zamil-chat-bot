import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'

export async function sendMessage(content: string) {
  try {
    const response = await axios.post(`${API_URL}/chat`, { message: content })
    return response.data
  } catch (error) {
    console.error('Error sending message:', error)
    return { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
  }
}

export async function fetchChatHistory() {
  try {
    const response = await axios.get(`${API_URL}/chat/history`)
    return response.data
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return []
  }
}

export async function addCustomResponse(category: string, keywords: string[], response: string) {
  try {
    const result = await axios.post(`${API_URL}/custom-responses`, { category, keywords, response })
    return result.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'An error occurred while adding the custom response');
    }
    throw error;
  }
}

export async function getSuggestions(input: string) {
  try {
    const response = await axios.get(`${API_URL}/custom-responses/suggestions`, { params: { input } })
    return response.data
  } catch (error) {
    console.error('Error fetching suggestions:', error)
    return []
  }
}