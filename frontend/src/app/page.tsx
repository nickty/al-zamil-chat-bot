"use client"

import { useAuth } from "@/components/AuthProvider"
import ChatWindow from "@/components/ChatWindow"
import { Button } from "@/components/ui/button"
import { signInWithGoogle } from "@/utils/auth"
import { useEffect, useState } from "react"
import { fetchChatHistory } from "@/utils/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Message {
  _id: string
  userMessage: string
  aiResponse: string
  timestamp: string
}

export default function Home() {
  const { user, loading, setUser } = useAuth()
  const [chatHistory, setChatHistory] = useState<Message[]>([])
  const router = useRouter()

  useEffect(() => {
    const loadChatHistory = async () => {
      if (user) {
        const history = await fetchChatHistory()
        setChatHistory(history)
      }
    }
    loadChatHistory()
  }, [user])

  const handleSignIn = async () => {
    try {
      const user = await signInWithGoogle()
      setUser(user) // Update AuthContext
      router.push("/") // Redirect using Next.js router
    } catch (error) {
      console.error("Sign in failed:", error)
      // Show error message to the user
      toast.error(error instanceof Error ? error.message : "Failed to sign in")
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Card className="w-[400px]">
          <CardContent className="p-6">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-center">Welcome to ZHI Equipment Assistant</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-center">Please sign in to continue</p>
            <Button onClick={handleSignIn}>Sign In with Google</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Chat with ZHI Equipment Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <ChatWindow chatHistory={chatHistory} onHistoryUpdate={setChatHistory} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

