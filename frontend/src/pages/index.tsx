import { useState, useEffect } from 'react'
import Head from 'next/head'
import ChatWindow from '../components/ChatWindow'
import CustomResponseForm from '../components/CustomResponseForm'
import { fetchChatHistory } from '../utils/api'

interface Message {
  role: 'user' | 'assistant'
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
    <div className="container mx-auto px-4">
      <Head>
        <title>ZHI Equipment Chatbot</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="py-20">
        <h1 className="text-4xl font-bold text-center mb-10">ZHI Assistant</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">Chat</h2>
            <ChatWindow chatHistory={chatHistory} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Chat History</h2>
            <div className="bg-white shadow-md rounded-lg max-h-96 overflow-y-auto p-4 mb-8">
              {chatHistory.map((message, index) => (
                <div key={index} className={`mb-2 ${message.role === 'assistant' ? 'text-blue-600' : 'text-gray-800'}`}>
                  <strong>{message.role === 'assistant' ? 'Assistant: ' : 'You: '}</strong>
                  {message.userMessage}
                </div>
              ))}
            </div>
            <CustomResponseForm />
          </div>
        </div>
      </main>
    </div>
  )
}