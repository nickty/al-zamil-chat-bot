import { useState, useEffect } from 'react'
import Head from 'next/head'
import ChatWindow from '../components/ChatWindow'
import AddCustomResponse from '../components/AddCustomResponse'
import { fetchChatHistory } from '../utils/api'

export default function Home() {
  const [chatHistory, setChatHistory] = useState([])
  const [showAddResponse, setShowAddResponse] = useState(false)

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
        <ChatWindow initialHistory={chatHistory} />
        <div className="mt-8">
          <button
            onClick={() => setShowAddResponse(!showAddResponse)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            {showAddResponse ? 'Hide' : 'Add Custom Response'}
          </button>
          {showAddResponse && (
            <div className="mt-4">
              <AddCustomResponse />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}