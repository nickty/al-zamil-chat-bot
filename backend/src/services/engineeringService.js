const { openai } = require("@ai-sdk/openai")
const { generateText, streamText } = require("ai")
const { EngineeringAnalysis } = require("../models/engineeringAnalysis")

class EngineeringService {
  async analyzeDesign(file, equipmentType, userId) {
    try {
      // Create engineering analysis record with the already uploaded file
      const engineeringAnalysis = await EngineeringAnalysis.create({
        projectId: `PRJ-${Date.now()}`,
        equipmentType,
        drawings: [
          {
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            storageUrl: file.storageUrl,
          },
        ],
        analysis: await this._generateAnalysis(equipmentType, file.storageUrl),
        createdBy: userId,
      })

      return engineeringAnalysis
    } catch (error) {
      console.error("Error in analyzeDesign:", error)
      throw error
    }
  }

  async _generateAnalysis(equipmentType, fileUrl) {
    try {
      // Use AI SDK to analyze the design
      const { text: analysisText } = await generateText({
        model: openai("gpt-3.5-turbo"), // Changed from gpt-4-turbo to gpt-3.5-turbo
        messages: [
          {
            role: "system",
            content: `You are an expert engineering analyst specializing in ${equipmentType}. 
                     Analyze the provided technical drawing and provide detailed specifications, 
                     material requirements, and compliance recommendations.`,
          },
          {
            role: "user",
            content: `Analyze this technical drawing for ${equipmentType}. Drawing URL: ${fileUrl}`,
          },
        ],
      })

      // Parse AI response into structured analysis
      const analysis = this._parseAnalysis(analysisText)

      return analysis
    } catch (error) {
      console.error("Error generating analysis:", error)
      throw error
    }
  }

  async getAnalysis(projectId) {
    return await EngineeringAnalysis.findOne({ projectId })
  }

  async getStandards(type) {
    const standards = {
      ASME: {
        name: "ASME Section VIII Division 1",
        description: "Rules for Construction of Pressure Vessels",
        version: "2021",
      },
      API: {
        name: "API 650",
        description: "Welded Tanks for Oil Storage",
        version: "2020",
      },
      ISO: {
        name: "ISO 9001",
        description: "Quality Management Systems",
        version: "2015",
      },
    }

    return standards[type.toUpperCase()] || null
  }

  _parseAnalysis(analysisText) {
    // Parse the AI response into structured data
    const sections = analysisText.split("\n\n")

    return {
      specifications: sections[0]?.split("\n") || [],
      materials: this._parseMaterials(sections[1] || ""),
      recommendations: sections[2]?.split("\n") || [],
      compliance: {
        status: this._determineComplianceStatus(sections[3] || ""),
        details: sections[3]?.split("\n") || [],
        standards: {
          asme: true,
          iso: true,
          api: true,
        },
      },
    }
  }

  _parseMaterials(materialsText) {
    // Parse materials section into structured data
    const materials = materialsText.split("\n").map((line) => {
      const [name, quantity, unit, cost] = line.split(",").map((s) => s.trim())
      return {
        name,
        quantity: Number.parseFloat(quantity) || 0,
        unit: unit || "pcs",
        estimatedCost: Number.parseFloat(cost) || 0,
      }
    })

    return materials
  }

  _determineComplianceStatus(complianceText) {
    if (complianceText.toLowerCase().includes("fail")) return "fail"
    if (complianceText.toLowerCase().includes("warning")) return "warning"
    return "pass"
  }
}

module.exports = new EngineeringService()

