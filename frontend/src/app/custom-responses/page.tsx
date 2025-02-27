"use client"

import { useAuth } from "@/components/AuthProvider"
import CustomResponseForm from "@/components/CustomResponseForm"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function CustomResponses() {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Manage Custom Responses</h1>
        <CustomResponseForm />
      </div>
    </div>
  )
}

