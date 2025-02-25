import axios from "axios"
import { getAuthToken } from "./auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const api = axios.create({
  baseURL: API_URL,
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/"
    }
    return Promise.reject(error)
  },
)

export async function sendMessage(content: string) {
  try {
    const response = await api.post("/chat", { message: content })
    return response.data
  } catch (error) {
    console.error("Error sending message:", error)
    return { role: "assistant", content: "Sorry, I encountered an error. Please try again." }
  }
}

export async function fetchChatHistory() {
  try {
    const response = await api.get("/chat/history")
    return response.data
  } catch (error) {
    console.error("Error fetching chat history:", error)
    return []
  }
}

export async function getSuggestions(input: string) {
  try {
    // Use proper query parameter
    const response = await api.get(`/custom-responses/suggestions`, {
      params: { query: input },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching suggestions:", error)
    return []
  }
}

export async function addCustomResponse(category: string, keywords: string[], response: string) {
  try {
    const result = await api.post("/custom-responses", { category, keywords, response })
    return result.data
  } catch (error) {
    console.error("Error adding custom response:", error)
    throw error
  }
}

