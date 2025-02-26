import axios from "axios"
import { getAuthToken, refreshAuthToken } from "./auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const api = axios.create({
  baseURL: API_URL,
})

// Flag to prevent multiple token refreshes
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token!)
    }
  })

  failedQueue = []
}

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

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is not auth related or we've already tried to refresh
    if (!error.response || error.response.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // If token refresh is in progress, queue the request
      try {
        const token = await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (err) {
        return Promise.reject(err)
      }
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const newToken = await refreshAuthToken()
      if (!newToken) {
        throw new Error("Failed to refresh token")
      }

      processQueue(null, newToken)
      originalRequest.headers.Authorization = `Bearer ${newToken}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      // Redirect to login page
      window.location.href = "/"
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export async function addCustomResponse(formData: FormData) {
  try {
    const response = await api.post("/custom-responses", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })

    if (!response.data) {
      throw new Error("No data received from server")
    }

    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    throw error
  }
}

export async function sendMessage(message: string) {
  try {
    const response = await api.post("/chat", { message })
    return response.data
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
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

export async function getSuggestions(query: string) {
  try {
    const response = await api.get(`/custom-responses/suggestions?query=${encodeURIComponent(query)}`)
    return response.data
  } catch (error) {
    console.error("Error getting suggestions:", error)
    return []
  }
}

export function getAttachmentUrl(responseId: string, filename: string) {
  return `${API_URL}/custom-responses/attachment/${responseId}/${filename}`
}

