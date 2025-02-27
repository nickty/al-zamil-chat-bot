"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Upload, FileText } from "lucide-react"
import type { CustomResponse } from "./admin/AdminDashboard"
import { addCustomResponse, updateCustomResponse } from "@/utils/api"
import { toast } from "sonner"

interface CustomResponseDialogProps {
  open: boolean
  onOpenChange: (refresh?: boolean) => void
  response: CustomResponse | null
}

export function CustomResponseDialog({ open, onOpenChange, response }: CustomResponseDialogProps) {
  const [category, setCategory] = useState("")
  const [keywords, setKeywords] = useState("")
  const [responseText, setResponseText] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [existingFiles, setExistingFiles] = useState<CustomResponse["attachments"]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (response) {
      setCategory(response.category)
      setKeywords(response.keywords.join(", "))
      setResponseText(response.response)
      setExistingFiles(response.attachments)
    } else {
      setCategory("")
      setKeywords("")
      setResponseText("")
      setExistingFiles([])
    }
    setFiles([])
  }, [response])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const keywordsArray = keywords
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k !== "")

      if (keywordsArray.length === 0) {
        throw new Error("At least one keyword is required")
      }

      const formData = new FormData()
      formData.append("category", category.trim())
      formData.append("keywords", JSON.stringify(keywordsArray))
      formData.append("response", responseText.trim())

      // Add new files
      files.forEach((file) => {
        formData.append("attachments", file)
      })

      // Add existing files to keep
      if (response) {
        formData.append("existingAttachments", JSON.stringify(existingFiles))
      }

      if (response) {
        await updateCustomResponse(response._id, formData)
        toast.success("Response updated successfully")
      } else {
        await addCustomResponse(formData)
        toast.success("Response added successfully")
      }

      onOpenChange(true)
    } catch (error) {
      console.error("Error submitting response:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save response")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    const totalSize = selectedFiles.reduce((acc, file) => acc + file.size, 0)

    if (totalSize > 5 * 1024 * 1024) {
      toast.error("Total file size exceeds 5MB limit")
      return
    }

    setFiles((prev) => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev]
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const removeExistingFile = (index: number) => {
    setExistingFiles((prev) => {
      const newFiles = [...prev]
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{response ? "Edit Response" : "Add Response"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Product Information"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="e.g., pressure vessel, tank, container"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="response">Response</Label>
            <Textarea
              id="response"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Enter the response text..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <Input
                type="file"
                onChange={handleFileSelect}
                multiple
                accept="image/*,.pdf,.xlsx,.xls,.doc,.docx,.ppt,.pptx,.txt,.csv"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload or drag and drop files here</span>
                  <span className="text-xs text-muted-foreground">
                    Max file size: 5MB. Supported formats: Images, PDF, Word, Excel, PowerPoint, CSV, TXT
                  </span>
                </div>
              </label>
            </div>
          </div>

          {existingFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Existing Files</Label>
              <div className="space-y-2">
                {existingFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm truncate max-w-[200px]">{file.originalName}</span>
                      <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeExistingFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="space-y-2">
              <Label>New Files</Label>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : response ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

