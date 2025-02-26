"use client"

import type React from "react"

import { useState, useRef } from "react"
import { addCustomResponse } from "@/utils/api"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { X, Upload, FileText, Image, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"

interface FileWithPreview extends File {
  preview?: string
}

export default function CustomResponseForm() {
  const [category, setCategory] = useState("")
  const [keywords, setKeywords] = useState("")
  const [response, setResponse] = useState("")
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0)

    if (totalSize > 5 * 1024 * 1024) {
      // 5MB limit
      toast.error("Total file size exceeds 5MB limit")
      return
    }

    const newFiles = selectedFiles.map((file) => {
      if (file.type.startsWith("image/")) {
        return Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      }
      return file
    })
    setFiles((prev) => [...prev, ...newFiles])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      const file = newFiles[index]
      if (file.preview) {
        URL.revokeObjectURL(file.preview)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith("image/")) return <Image className="h-6 w-6" />
    if (mimetype.includes("pdf")) return <FileText className="h-6 w-6" />
    if (mimetype.includes("excel") || mimetype.includes("spreadsheet")) return <FileSpreadsheet className="h-6 w-6" />
    return <FileText className="h-6 w-6" />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate inputs
      if (!category.trim()) {
        throw new Error("Category is required")
      }
      if (!keywords.trim()) {
        throw new Error("Keywords are required")
      }
      if (!response.trim()) {
        throw new Error("Response is required")
      }

      const keywordsArray = keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k !== "")

      if (keywordsArray.length === 0) {
        throw new Error("At least one non-empty keyword is required")
      }

      const formData = new FormData()
      formData.append("category", category.trim())
      formData.append("keywords", JSON.stringify(keywordsArray))
      formData.append("response", response.trim())

      files.forEach((file) => {
        formData.append("attachments", file)
      })

      const result = await addCustomResponse(formData)
      console.log("API Response:", result)

      // Clear form only on success
      setCategory("")
      setKeywords("")
      setResponse("")
      setFiles([])

      toast.success("Custom response added successfully!")
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Custom Response</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                multiple
                accept="image/*,.pdf,.xlsx,.xls"
                className="hidden"
              />
              <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Max file size: 5MB. Supported formats: Images, PDF, Excel
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.type)}
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Response"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

