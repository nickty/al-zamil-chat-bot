import { useState, useEffect } from 'react'
import { sendMessage, getSuggestions } from '../utils/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatWindowProps {
  initialHistory: Message[]
}

export default function ChatWindow({ initialHistory }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialHistory)
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (input.trim()) {
        const fetchedSuggestions = await getSuggestions(input)
        setSuggestions(fetchedSuggestions)
      } else {
        setSuggestions([])
      }
    }

    const debounce = setTimeout(() => {
      fetchSuggestions()
    }, 300)

    return () => clearTimeout(debounce)
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages([...messages, userMessage])
    setInput('')
    setSuggestions([])

    const assistantMessage = await sendMessage(input)
    setMessages(prevMessages => [...prevMessages, assistantMessage])
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setSuggestions([])
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-md rounded-lg max-h-96 overflow-y-auto p-4 mb-4">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === 'assistant' ? 'text-blue-600' : 'text-gray-800'}`}>
            <strong>{message.role === 'assistant' ? 'Assistant: ' : 'You: '}</strong>
            {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Ask about our equipment..."
        />
        <button type="submit" className="absolute right-2 top-2 bg-blue-500 text-white px-4 py-1 rounded">Send</button>
      </form>
      {suggestions.length > 0 && (
        <ul className="bg-white shadow-md rounded-lg mt-2">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}