"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, getCurrentUser } from "@/utils/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  setUser: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error loading user:", error)
        setError(error instanceof Error ? error.message : "Authentication error")
        // Show error message to the user
        if (error instanceof Error && error.message.includes("suspended")) {
          toast.error(error.message)
        }
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const value = {
    user,
    loading,
    error,
    setUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}

