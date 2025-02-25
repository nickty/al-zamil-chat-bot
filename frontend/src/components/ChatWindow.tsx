"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { sendMessage, getSuggestions } from "@/utils/api"
import { Input } from "./ui/input"
import { Button } from "./ui/button"

interface Message {
  _id: string
  userMessage: string
  aiResponse: string
  timestamp: string
}

interface ChatWindowProps {
  chatHistory: Message[]
  onHistoryUpdate: (history: Message[]) => void
}

export default function ChatWindow({ chatHistory, onHistoryUpdate }: ChatWindowProps) {
  const [input, setInput] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Scroll to bottom when chat history changes
  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom, suggestions])

  // Fetch suggestions while typing
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (input.trim()) {
        try {
          const fetchedSuggestions = await getSuggestions(input)
          setSuggestions(fetchedSuggestions)
        } catch (error) {
          console.error("Error fetching suggestions:", error)
          setSuggestions([])
        }
      } else {
        setSuggestions([])
      }
    }

    const debounceTimer = setTimeout(() => {
      fetchSuggestions()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    const userMessage: Message = {
      _id: Date.now().toString(),
      userMessage: input,
      aiResponse: "",
      timestamp: new Date().toISOString(),
    }

    // Update with user message immediately
    const updatedHistory = [...chatHistory, userMessage]
    onHistoryUpdate(updatedHistory)
    setInput("")
    setSuggestions([])
    scrollToBottom()

    try {
      const assistantMessage = await sendMessage(input)
      const newMessage: Message = {
        _id: (Date.now() + 1).toString(),
        userMessage: "",
        aiResponse: assistantMessage.content,
        timestamp: new Date().toISOString(),
      }
      // Update with AI response
      onHistoryUpdate([...updatedHistory, newMessage])
      scrollToBottom()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setSuggestions([])
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto pr-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {chatHistory.map((message) => (
            <React.Fragment key={message._id}>
              {message.userMessage && (
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
                    {message.userMessage}
                  </div>
                </div>
              )}
              {message.aiResponse && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">{message.aiResponse}</div>
                </div>
              )}
            </React.Fragment>
          ))}
          {/* Invisible div for scrolling */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="relative mt-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="pr-20"
              disabled={isLoading}
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 bottom-full mb-1 bg-popover border rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-muted cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  )
}

