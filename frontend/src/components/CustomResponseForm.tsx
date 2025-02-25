"use client"

import type React from "react"

import { useState } from "react"
import { addCustomResponse } from "@/utils/api"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export default function CustomResponseForm() {
  const [category, setCategory] = useState("")
  const [keywords, setKeywords] = useState("")
  const [response, setResponse] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!category.trim() || !keywords.trim() || !response.trim()) {
      setError("All fields are required")
      return
    }

    try {
      const keywordsArray = keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k !== "")

      if (keywordsArray.length === 0) {
        setError("At least one non-empty keyword is required")
        return
      }

      await addCustomResponse(category.trim(), keywordsArray, response.trim())
      setCategory("")
      setKeywords("")
      setResponse("")
      setSuccess("Custom response added successfully!")
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An unexpected error occurred")
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Custom Response</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-red-500 bg-red-50 rounded-md">{error}</div>}
          {success && <div className="p-3 text-green-500 bg-green-50 rounded-md">{success}</div>}

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Product Information"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., pressure vessel, tank, container"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="response">Response</Label>
            <Textarea
              id="response"
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Enter the response text..."
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full">
            Add Response
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

