import axios from "axios"
import { getAuthToken, refreshAuthToken } from "./auth"
import { toast } from "sonner"
import { setCurrentUser } from "./auth"

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

    // Check if error is due to suspended account
    if (error.response?.status === 403 && error.response?.data?.code === "auth/account-suspended") {
      // Show suspension notification
      toast.error("Your account has been suspended. Please contact an administrator.")

      // Clear user session
      setCurrentUser(null, null)

      // Redirect to home page
      window.location.href = "/"

      return Promise.reject(error)
    }

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

// Update the getAllCustomResponses function to include a query parameter to populate user data
export async function getAllCustomResponses() {
  try {
    const response = await api.get("/custom-responses?populate=user")
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

// Add these functions to your existing api.ts file

export interface User {
  _id: string
  name: string
  email: string
  picture: string
  role: "user" | "admin"
  suspended: boolean
  lastLogin: string
  createdAt: string
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const response = await api.get("/users")
    return response.data
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

export async function getUserById(id: string): Promise<User> {
  try {
    const response = await api.get(`/users/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching user:", error)
    throw error
  }
}

export async function updateUserSuspension(id: string, suspended: boolean): Promise<User> {
  try {
    const response = await api.patch(`/users/${id}/suspend`, { suspended })
    return response.data
  } catch (error) {
    console.error("Error updating user suspension:", error)
    throw error
  }
}

export async function updateUserRole(id: string, role: "user" | "admin"): Promise<User> {
  try {
    const response = await api.patch(`/users/${id}/role`, { role })
    return response.data
  } catch (error) {
    console.error("Error updating user role:", error)
    throw error
  }
}

// Add these interfaces and functions to your existing api.ts file

// Client types
export interface Client {
  _id: string
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  createdAt: string
}

// Estimation types
export interface EstimationItem {
  _id: string
  name: string
  description: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
  type: "material" | "labor" | "service"
}

export interface EstimationHistory {
  _id: string
  action: string
  description: string
  details?: any
  user?: {
    _id: string
    name: string
  }
  timestamp: string
}

export interface EstimationSummary {
  _id: string
  title: string
  description: string
  estimationNumber: string
  status: string
  totalAmount: number
  client: {
    _id: string
    name: string
  }
  createdAt: string
}

export interface EstimationDetail {
  _id: string
  title: string
  description: string
  estimationNumber: string
  status: string
  totalAmount: number
  client: Client
  items: EstimationItem[]
  history: EstimationHistory[]
  createdAt: string
  updatedAt: string
}

// Client API functions
export async function getClients(): Promise<Client[]> {
  try {
    const response = await api.get("/clients")
    return response.data
  } catch (error) {
    console.error("Error fetching clients:", error)
    throw error
  }
}

export async function getClientById(id: string): Promise<Client> {
  try {
    const response = await api.get(`/clients/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching client:", error)
    throw error
  }
}

// Estimation API functions
export async function getAllEstimations(): Promise<EstimationSummary[]> {
  try {
    const response = await api.get("/estimations")
    return response.data
  } catch (error) {
    console.error("Error fetching estimations:", error)
    throw error
  }
}

export async function getEstimationById(id: string): Promise<EstimationDetail> {
  try {
    const response = await api.get(`/estimations/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching estimation:", error)
    throw error
  }
}

export async function createEstimation(data: any): Promise<EstimationDetail> {
  try {
    const response = await api.post("/estimations", data)
    return response.data
  } catch (error) {
    console.error("Error creating estimation:", error)
    throw error
  }
}

export async function updateEstimation(id: string, data: any): Promise<EstimationDetail> {
  try {
    const response = await api.put(`/estimations/${id}`, data)
    return response.data
  } catch (error) {
    console.error("Error updating estimation:", error)
    throw error
  }
}

export async function updateEstimationStatus(id: string, status: string): Promise<EstimationDetail> {
  try {
    const response = await api.patch(`/estimations/${id}/status`, { status })
    return response.data
  } catch (error) {
    console.error("Error updating estimation status:", error)
    throw error
  }
}

export async function getEstimationDashboard() {
  try {
    const response = await api.get("/estimations/dashboard")
    return response.data
  } catch (error) {
    console.error("Error fetching estimation dashboard:", error)
    throw error
  }
}

// Add this function to your existing api.ts file

export async function createClient(data: {
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
}): Promise<Client> {
  try {
    const response = await api.post("/clients", data)
    return response.data
  } catch (error) {
    console.error("Error creating client:", error)
    throw error
  }
}

// Add these functions to your existing api.ts file for finance

export async function getFinancialMetrics() {
  try {
    const response = await api.get("/finance/metrics")
    return response.data
  } catch (error) {
    console.error("Error fetching financial metrics:", error)
    throw error
  }
}

export async function updateFinancialMetrics(data: any) {
  try {
    const response = await api.post("/finance/metrics", data)
    return response.data
  } catch (error) {
    console.error("Error updating financial metrics:", error)
    throw error
  }
}

export async function getBudgetData() {
  try {
    const response = await api.get("/finance/budget")
    return response.data
  } catch (error) {
    console.error("Error fetching budget data:", error)
    throw error
  }
}

export async function updateBudget(data: any) {
  try {
    const response = await api.post("/finance/budget", data)
    return response.data
  } catch (error) {
    console.error("Error updating budget:", error)
    throw error
  }
}

export async function getFinancialReports(type: string, startDate: string, endDate: string) {
  try {
    const response = await api.get(`/finance/reports`, {
      params: { type, startDate, endDate },
    })
    return response.data
  } catch (error) {
    console.error("Error fetching financial reports:", error)
    throw error
  }
}