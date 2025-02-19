"use client"

import React, { useState, useEffect, useRef } from "react"
import { sendMessage, getSuggestions } from "../utils/api"

interface Message {
  _id: string
  userMessage: string
  aiResponse: string
  timestamp: string
}

interface ChatWindowProps {
  chatHistory: Message[]
}

export default function ChatWindow({ chatHistory }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(chatHistory)
  const [input, setInput] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMessages(chatHistory)
  }, [chatHistory])

  useEffect(() => {
    scrollToBottom()
  }, [messages]) // Removed unnecessary dependency: messages

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

  const scrollToBottom = () => {
    console.log("bottom", chatContainerRef.current?.scrollHeight);
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  const handleSubmit = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      _id: Date.now().toString(),
      userMessage: input,
      aiResponse: "",
      timestamp: new Date().toISOString(),
    }
    setMessages((prevMessages) => [userMessage, ...prevMessages])
    setInput("")
    setSuggestions([])

    const assistantMessage = await sendMessage(input)
    setMessages((prevMessages) => [
      {
        _id: (Date.now() + 1).toString(),
        userMessage: "",
        aiResponse: assistantMessage.content,
        timestamp: new Date().toISOString(),
      },
      ...prevMessages,
    ])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === "Tab") {
      e.preventDefault()
      if (suggestions.length > 0) {
        setInput(suggestions[0])
        setSuggestions([])
      }
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setSuggestions([])
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4" ref={chatContainerRef}>
        {messages
          .slice()
          .reverse()
          .map((message) => (
            <React.Fragment key={message._id}>
              {message.userMessage && (
                <div className="p-3 rounded-lg bg-gray-100 mr-4">
                  <strong>You: </strong>
                  {message.userMessage}
                </div>
              )}
              {message.aiResponse && (
                <div className="p-3 rounded-lg bg-blue-100 ml-4">
                  <strong>Assistant: </strong>
                  {message.aiResponse}
                </div>
              )}
            </React.Fragment>
          ))}
      </div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 pr-20 border rounded-lg"
          placeholder="Ask about our equipment..."
        />
        <button onClick={handleSubmit} className="absolute right-2 top-2 bg-blue-500 text-white px-4 py-1 rounded">
          Send
        </button>
        {suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 bottom-full mb-1 bg-white shadow-md rounded-lg max-h-40 overflow-y-auto z-10">
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
    </div>
  )
}

