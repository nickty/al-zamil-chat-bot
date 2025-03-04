const { generateText } = require("ai")
const { openai } = require("@ai-sdk/openai")
const { EngineeringAnalysis } = require("../models/engineeringAnalysis")

class EngineeringService {
  async analyzeDesign(file, equipmentType, userId) {
    try {
      console.log("Analyzing design for equipment type:", equipmentType)
      console.log("File details:", {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      })

      // Create engineering analysis record with the uploaded file
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
      console.log("Generating analysis with AI for:", equipmentType)
      console.log("File URL:", fileUrl)

      // Use AI SDK to analyze the design
      const { text: analysisText } = await generateText({
        model: openai("gpt-3.5-turbo"),
        messages: [
          {
            role: "system",
            content: `You are an expert engineering analyst specializing in ${equipmentType}. 
                     Analyze the provided technical drawing and provide detailed specifications, 
                     material requirements, and compliance recommendations. Format your response in clear sections:
                     
                     SPECIFICATIONS:
                     - Specification 1
                     - Specification 2
                     
                     MATERIALS:
                     - Material 1, Quantity, Unit, Cost
                     - Material 2, Quantity, Unit, Cost
                     
                     RECOMMENDATIONS:
                     - Recommendation 1
                     - Recommendation 2
                     
                     COMPLIANCE:
                     - Compliance detail 1
                     - Compliance detail 2`,
          },
          {
            role: "user",
            content: `Analyze this technical drawing for ${equipmentType}. Drawing URL: ${fileUrl}
                     Since you cannot directly view the image, please provide a general analysis based on 
                     standard ${equipmentType} designs and industry best practices.`,
          },
        ],
      })

      console.log("AI analysis response received")

      // Parse AI response into structured analysis
      const analysis = this._parseAnalysis(analysisText)
      return analysis
    } catch (error) {
      console.error("Error generating analysis:", error)
      // Return default analysis if AI fails
      return this._getDefaultAnalysis(equipmentType)
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
    try {
      console.log("Parsing analysis text")

      // Extract sections using regex
      const specificationsMatch = analysisText.match(/SPECIFICATIONS:([\s\S]*?)(?=MATERIALS:|$)/i)
      const materialsMatch = analysisText.match(/MATERIALS:([\s\S]*?)(?=RECOMMENDATIONS:|$)/i)
      const recommendationsMatch = analysisText.match(/RECOMMENDATIONS:([\s\S]*?)(?=COMPLIANCE:|$)/i)
      const complianceMatch = analysisText.match(/COMPLIANCE:([\s\S]*?)(?=$)/i)

      // Extract specifications
      const specifications = specificationsMatch
        ? specificationsMatch[1]
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.startsWith("-"))
            .map((line) => line.substring(1).trim())
            .filter(Boolean)
        : []

      // Extract and parse materials
      const materials = materialsMatch
        ? materialsMatch[1]
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.startsWith("-"))
            .map((line) => {
              const parts = line
                .substring(1)
                .trim()
                .split(",")
                .map((p) => p.trim())
              return {
                name: parts[0] || "Unknown material",
                quantity: Number.parseFloat(parts[1]) || 1,
                unit: parts[2] || "pcs",
                estimatedCost: Number.parseFloat(parts[3]) || 100,
              }
            })
        : []

      // Extract recommendations
      const recommendations = recommendationsMatch
        ? recommendationsMatch[1]
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.startsWith("-"))
            .map((line) => line.substring(1).trim())
            .filter(Boolean)
        : []

      // Extract compliance details
      const complianceDetails = complianceMatch
        ? complianceMatch[1]
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.startsWith("-"))
            .map((line) => line.substring(1).trim())
            .filter(Boolean)
        : []

      // Determine compliance status based on content
      let complianceStatus = "pass"
      if (
        complianceDetails.some(
          (detail) =>
            detail.toLowerCase().includes("fail") ||
            detail.toLowerCase().includes("critical") ||
            detail.toLowerCase().includes("severe"),
        )
      ) {
        complianceStatus = "fail"
      } else if (
        complianceDetails.some(
          (detail) =>
            detail.toLowerCase().includes("warning") ||
            detail.toLowerCase().includes("caution") ||
            detail.toLowerCase().includes("review"),
        )
      ) {
        complianceStatus = "warning"
      }

      return {
        specifications: specifications.length > 0 ? specifications : ["Standard design specifications apply"],
        materials: materials.length > 0 ? materials : this._getDefaultMaterials(),
        recommendations: recommendations.length > 0 ? recommendations : ["Follow industry best practices"],
        compliance: {
          status: complianceStatus,
          details: complianceDetails.length > 0 ? complianceDetails : ["Standard compliance requirements apply"],
          standards: {
            asme: true,
            iso: true,
            api: complianceStatus !== "fail",
          },
        },
      }
    } catch (error) {
      console.error("Error parsing analysis:", error)
      return this._getDefaultAnalysis()
    }
  }

  _getDefaultAnalysis(equipmentType = "equipment") {
    return {
      specifications: [
        `Standard ${equipmentType} design parameters`,
        "Material grade: Industry standard",
        "Design pressure: As per requirements",
        "Design temperature: Standard operating range",
      ],
      materials: this._getDefaultMaterials(),
      recommendations: [
        "Follow manufacturer guidelines for installation",
        "Implement regular maintenance schedule",
        "Ensure proper documentation of all modifications",
      ],
      compliance: {
        status: "warning",
        details: [
          "Design meets basic industry standards",
          "Further review recommended for specific applications",
          "Compliance verification required before implementation",
        ],
        standards: {
          asme: true,
          iso: true,
          api: true,
        },
      },
    }
  }

  _getDefaultMaterials() {
    return [
      {
        name: "Structural Steel",
        quantity: 1500,
        unit: "kg",
        estimatedCost: 3000,
      },
      {
        name: "Fasteners",
        quantity: 200,
        unit: "pcs",
        estimatedCost: 500,
      },
      {
        name: "Gaskets",
        quantity: 20,
        unit: "pcs",
        estimatedCost: 300,
      },
    ]
  }
}

module.exports = new EngineeringService()

