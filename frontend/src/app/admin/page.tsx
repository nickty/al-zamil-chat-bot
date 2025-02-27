"use client"

import { useAuth } from "@/components/AuthProvider"
import { AdminDashboard } from "@/components/admin/AdminDashboard"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (user.role !== "admin") {
    return null
  }

  return <AdminDashboard />
}

