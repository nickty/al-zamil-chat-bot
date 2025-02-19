"use client"

import { useState, useEffect } from "react"
import Head from "next/head"
import ChatWindow from "../components/ChatWindow"
import CustomResponseForm from "../components/CustomResponseForm"
import { fetchChatHistory } from "../utils/api"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function Home() {
  const [chatHistory, setChatHistory] = useState<Message[]>([])

  useEffect(() => {
    const loadChatHistory = async () => {
      const history = await fetchChatHistory()
      setChatHistory(history)
    }
    loadChatHistory()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>ZHI Equipment Chatbot</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">ZHI Assistant</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Chat</h2>
              <ChatWindow chatHistory={chatHistory} />
            </div>
          </div>
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <CustomResponseForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

