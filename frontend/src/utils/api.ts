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

// Add request interceptor
api.interceptors.request.use(
  async (config) => {
    let token = getAuthToken()

    // If no token or token is about to expire, try to refresh
    if (!token && !isRefreshing) {
      try {
        token = await refreshAuthToken()
      } catch (error) {
        console.error("Token refresh failed:", error)
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Check if error is auth-related and we haven't retried yet
    if (
      error.response?.status === 401 &&
      error.response?.data?.code === "auth/id-token-expired" &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
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
        const token = await refreshAuthToken()
        if (!token) {
          throw new Error("Failed to refresh token")
        }

        processQueue(null, token)
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        window.location.href = "/" // Redirect to login
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

// Export API methods
export async function addCustomResponse(formData: FormData) {
  try {
    const response = await api.post("/custom-responses", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
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
    throw error
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

export async function getAllCustomResponses() {
  try {
    const response = await api.get("/custom-responses")
    return response.data
  } catch (error) {
    console.error("Error fetching custom responses:", error)
    throw error
  }
}

export async function deleteCustomResponse(id: string) {
  try {
    const response = await api.delete(`/custom-responses/${id}`)
    return response.data
  } catch (error) {
    console.error("Error deleting custom response:", error)
    throw error
  }
}

export async function updateCustomResponse(id: string, formData: FormData) {
  try {
    const response = await api.put(`/custom-responses/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    console.error("Error updating custom response:", error)
    throw error
  }
}

// Engineering API methods
export interface EngineeringAnalysis {
  projectId: string
  equipmentType: string
  drawings: Array<{
    filename: string
    originalName: string
    storageUrl: string
  }>
  analysis: {
    specifications: string[]
    materials: Array<{
      name: string
      quantity: number
      unit: string
      estimatedCost: number
    }>
    recommendations: string[]
    compliance: {
      status: "pass" | "warning" | "fail"
      details: string[]
      standards: {
        asme: boolean
        iso: boolean
        api: boolean
      }
    }
  }
}

export async function analyzeEngineering(formData: FormData): Promise<EngineeringAnalysis> {
  try {
    const response = await api.post("/engineering/analyze", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    throw error
  }
}

export async function getEngineeringAnalysis(projectId: string): Promise<EngineeringAnalysis> {
  try {
    const response = await api.get(`/engineering/analysis/${projectId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching engineering analysis:", error)
    throw error
  }
}

export async function getEngineeringStandards(type: string): Promise<{
  name: string
  description: string
  version: string
}> {
  try {
    const response = await api.get(`/engineering/standards/${type}`)
    return response.data
  } catch (error) {
    console.error("Error fetching engineering standards:", error)
    throw error
  }
}

// Production API methods
export async function getProductionMetrics() {
  try {
    const response = await api.get("/production/metrics")
    return response.data
  } catch (error) {
    console.error("Error fetching production metrics:", error)
    throw error
  }
}

export async function updateProductionMetrics(metrics: {
  productionStatus: any
  workforceStatus: any
  equipmentStatus: any
  qualityMetrics: any
}) {
  try {
    const response = await api.post("/production/metrics", metrics)
    return response.data
  } catch (error) {
    console.error("Error updating production metrics:", error)
    throw error
  }
}

export async function getProductionAnalytics(startDate: Date, endDate: Date) {
  try {
    const response = await api.get("/production/analytics", {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching production analytics:", error)
    throw error
  }
}

