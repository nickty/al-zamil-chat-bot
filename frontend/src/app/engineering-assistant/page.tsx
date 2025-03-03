"use client"

import type React from "react"

import { useState } from "react"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Analysis {
  projectId: string
  equipmentType: string
  drawings: Array<{
    filename: string
    originalName: string
    storageUrl: string
  }>
  analysis: {
    specifications: string[]
    materials: Array<{
      name: string
      quantity: number
      unit: string
      estimatedCost: number
    }>
    recommendations: string[]
    compliance: {
      status: "pass" | "warning" | "fail"
      details: string[]
      standards: {
        asme: boolean
        iso: boolean
        api: boolean
      }
    }
  }
}

async function analyzeEngineering(formData: FormData): Promise<Analysis> {
  const response = await fetch("/api/engineering/analyze", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Analysis failed")
  }

  return (await response.json()) as Analysis
}

export default function EngineeringPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [equipmentType, setEquipmentType] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const allowedTypes = [
        "application/acad",
        "image/vnd.dxf",
        "application/dxf",
        "application/dwg",
        "image/x-dwg",
        "application/pdf",
        "image/jpeg",
        "image/png",
      ]

      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file)
      } else {
        toast.error("Please select a valid CAD file (DWG, DXF), PDF, or image")
      }
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile || !equipmentType) {
      toast.error("Please select both a file and equipment type")
      return
    }

    setAnalyzing(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("drawing", selectedFile)
      formData.append("equipmentType", equipmentType)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 500)

      const analysis = await analyzeEngineering(formData)

      clearInterval(progressInterval)
      setUploadProgress(100)

      setAnalysis(analysis)
      toast.success("Analysis completed successfully")
    } catch (error) {
      console.error("Analysis error:", error)
      toast.error("Failed to analyze drawing")
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Engineering Design Assistant</CardTitle>
            <CardDescription>Upload your technical drawing for AI-powered analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="equipment-type">Equipment Type</Label>
              <Select value={equipmentType} onValueChange={setEquipmentType}>
                <SelectTrigger id="equipment-type">
                  <SelectValue placeholder="Select equipment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pressure-vessel">Pressure Vessel</SelectItem>
                  <SelectItem value="heat-exchanger">Heat Exchanger</SelectItem>
                  <SelectItem value="storage-tank">Storage Tank</SelectItem>
                  <SelectItem value="skid-mounted">Skid Mounted Equipment</SelectItem>
                  <SelectItem value="fired-heater">Fired Heater</SelectItem>
                  <SelectItem value="crane">Overhead Crane</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="drawing-file">Technical Drawing</Label>
              <div className="border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <Input
                  id="drawing-file"
                  type="file"
                  accept=".dwg,.dxf,.pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="drawing-file" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
                    </span>
                    <span className="text-xs text-muted-foreground">Supported formats: DWG, DXF, PDF, Images</span>
                  </div>
                </label>
              </div>
            </div>

            {analyzing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <Button onClick={handleAnalyze} disabled={!selectedFile || !equipmentType || analyzing} className="w-full">
              {analyzing ? "Analyzing..." : "Analyze Design"}
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              <CardDescription>Project ID: {analysis.projectId}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="specifications" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                </TabsList>

                <TabsContent value="specifications" className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Technical Specifications</h3>
                    <ul className="space-y-2">
                      {analysis.analysis.specifications.map((spec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Recommendations</h3>
                    <ul className="space-y-2">
                      {analysis.analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500 mt-1" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="materials">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Material Requirements</h3>
                    <div className="grid gap-4">
                      {analysis.analysis.materials.map((material, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{material.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {material.quantity} {material.unit}
                            </p>
                          </div>
                          <p className="font-medium">${material.estimatedCost.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="compliance">
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-lg ${
                        analysis.analysis.compliance.status === "pass"
                          ? "bg-green-50"
                          : analysis.analysis.compliance.status === "warning"
                            ? "bg-yellow-50"
                            : "bg-red-50"
                      }`}
                    >
                      <h3 className="font-semibold mb-2">Compliance Status</h3>
                      <ul className="space-y-2">
                        {analysis.analysis.compliance.details.map((detail, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle
                              className={`h-4 w-4 mt-1 ${
                                analysis.analysis.compliance.status === "pass"
                                  ? "text-green-500"
                                  : analysis.analysis.compliance.status === "warning"
                                    ? "text-yellow-500"
                                    : "text-red-500"
                              }`}
                            />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm">ASME</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          {analysis.analysis.compliance.standards.asme ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm">ISO</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          {analysis.analysis.compliance.standards.iso ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="p-4">
                          <CardTitle className="text-sm">API</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          {analysis.analysis.compliance.standards.api ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

