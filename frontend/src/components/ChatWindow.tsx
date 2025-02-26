"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { sendMessage, getSuggestions } from "@/utils/api"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Download, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "react-hot-toast"

interface Attachment {
  filename: string
  originalName: string
  mimetype: string
  storageUrl: string
}

interface Message {
  _id: string
  userMessage: string
  aiResponse: string
  timestamp: string
  attachments?: Attachment[]
}

interface ChatWindowProps {
  chatHistory: Message[]
  onHistoryUpdate: (history: Message[]) => void
}

export default function ChatWindow({ chatHistory, onHistoryUpdate }: ChatWindowProps) {
  const [input, setInput] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Keep input focused
  useEffect(() => {
    inputRef.current?.focus()
  }, [chatHistory])

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory])

  useEffect(() => {
    scrollToBottom()
  }, [scrollToBottom])

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (input.trim()) {
        try {
          const fetchedSuggestions = await getSuggestions(input)
          setSuggestions(fetchedSuggestions)
          setSelectedSuggestionIndex(-1) // Reset selection when new suggestions arrive
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length > 0) {
      if (e.key === "Tab") {
        e.preventDefault()
        if (selectedSuggestionIndex === -1) {
          // If no suggestion is selected, select the first one
          setInput(suggestions[0])
          setSuggestions([])
        } else {
          // Complete with the currently selected suggestion
          setInput(suggestions[selectedSuggestionIndex])
          setSuggestions([])
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : prev))
      }
    }
  }

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
        attachments: assistantMessage.attachments,
      }
      onHistoryUpdate([...updatedHistory, newMessage])
      scrollToBottom()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
      inputRef.current?.focus() // Refocus input after sending
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    setSuggestions([])
    inputRef.current?.focus()
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      // Fetch the file first
      const response = await fetch(url)
      if (!response.ok) throw new Error("Download failed")

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = objectUrl
      link.download = filename // Use the original filename
      document.body.appendChild(link)
      link.click()

      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error("Download error:", error)
      toast.error("Failed to download file")
    }
  }

  // Only show preview for images
  const canPreview = (mimetype: string) => {
    return mimetype.startsWith("image/")
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
                  <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                    <div className="whitespace-pre-wrap">{message.aiResponse}</div>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(attachment.storageUrl, attachment.originalName)}
                              className="flex items-center"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              <span className="truncate max-w-[200px]">{attachment.originalName}</span>
                            </Button>
                            {canPreview(attachment.mimetype) && (
                              <Button variant="ghost" size="sm" onClick={() => setPreviewUrl(attachment.storageUrl)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
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
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="pr-20"
              disabled={isLoading}
              autoComplete="off"
              autoFocus // Add autoFocus
            />
            {suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 bottom-full mb-1 bg-popover border rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className={`px-4 py-2 cursor-pointer ${
                      index === selectedSuggestionIndex ? "bg-muted" : "hover:bg-muted"
                    }`}
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

      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="relative aspect-video">
              <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

