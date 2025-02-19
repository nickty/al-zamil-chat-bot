"use client"

import type React from "react"
import { useState } from "react"
import { addCustomResponse } from "../utils/api"

const CustomResponseForm: React.FC = () => {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Add Custom Response</h2>
      {error && <div className="text-red-500 bg-red-100 p-2 rounded">{error}</div>}
      {success && <div className="text-green-500 bg-green-100 p-2 rounded">{success}</div>}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>
      <div>
        <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
          Keywords (comma-separated)
        </label>
        <input
          type="text"
          id="keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>
      <div>
        <label htmlFor="response" className="block text-sm font-medium text-gray-700">
          Response
        </label>
        <textarea
          id="response"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          rows={4}
          required
        ></textarea>
      </div>
      <button
        type="submit"
        className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Add Custom Response
      </button>
    </form>
  )
}

export default CustomResponseForm

