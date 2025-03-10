const express = require("express")
const { authMiddleware } = require("../middleware/auth")
const { Estimation } = require("../models/estimation")
const { Client } = require("../models/client")
const mongoose = require("mongoose")

const router = express.Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

// Get all estimations (with filters)
router.get("/", async (req, res, next) => {
  try {
    const { status, client, startDate, endDate } = req.query
    const query = { status: { $ne: "deleted" } }

    if (status) {
      query.status = status
    }

    if (client) {
      query.client = client
    }

    if (startDate || endDate) {
      query.createdAt = {}
      if (startDate) {
        query.createdAt.$gte = new Date(startDate)
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate)
      }
    }

    const estimations = await Estimation.find(query).populate("client", "name").sort({ createdAt: -1 })

    res.json(estimations)
  } catch (error) {
    next(error)
  }
})

// Get estimation dashboard data
router.get("/dashboard", async (req, res, next) => {
  try {
    // Get status distribution
    const statusDistribution = await Estimation.aggregate([
      { $match: { status: { $ne: "deleted" } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])

    // Get monthly totals for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyTotals = await Estimation.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, status: { $ne: "deleted" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { month: "$_id", total: 1, _id: 0 } },
    ])

    // Get type distribution (materials, labor, services)
    const typePipeline = [
      { $match: { status: { $ne: "deleted" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.type",
          value: { $sum: "$items.totalPrice" },
        },
      },
      { $project: { type: "$_id", value: 1, _id: 0 } },
    ]

    const typeDistribution = await Estimation.aggregate(typePipeline)

    // Get top clients
    const topClients = await Estimation.aggregate([
      { $match: { status: { $ne: "deleted" } } },
      {
        $group: {
          _id: "$client",
          count: { $sum: 1 },
          value: { $sum: "$totalAmount" },
        },
      },
      { $sort: { value: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "clients",
          localField: "_id",
          foreignField: "_id",
          as: "clientData",
        },
      },
      {
        $project: {
          client: { $arrayElemAt: ["$clientData.name", 0] },
          count: 1,
          value: 1,
          _id: 0,
        },
      },
    ])

    // Format status distribution
    const statusData = {
      draft: 0,
      pending_approval: 0,
      approved: 0,
      archived: 0,
    }

    statusDistribution.forEach((item) => {
      if (statusData.hasOwnProperty(item._id)) {
        statusData[item._id] = item.count
      }
    })

    // Format type distribution
    const typeData = {
      materials: 0,
      labor: 0,
      services: 0,
    }

    typeDistribution.forEach((item) => {
      if (item.type === "material") typeData.materials = item.value
      if (item.type === "labor") typeData.labor = item.value
      if (item.type === "service") typeData.services = item.value
    })

    res.json({
      statusDistribution: statusData,
      monthlyTotals: monthlyTotals,
      typeDistribution: typeData,
      topClients: topClients,
    })
  } catch (error) {
    next(error)
  }
})

// Get estimation by ID
router.get("/:id", async (req, res, next) => {
  try {
    const estimation = await Estimation.findById(req.params.id).populate("client").populate("history.user", "name")

    if (!estimation || estimation.status === "deleted") {
      return res.status(404).json({ error: "Estimation not found" })
    }

    res.json(estimation)
  } catch (error) {
    next(error)
  }
})

// Create new estimation
router.post("/", async (req, res, next) => {
  try {
    const { title, description, clientId, items, status } = req.body

    if (!title) {
      return res.status(400).json({ error: "Title is required" })
    }

    if (!clientId) {
      return res.status(400).json({ error: "Client is required" })
    }

    // Verify client exists
    const client = await Client.findById(clientId)
    if (!client) {
      return res.status(404).json({ error: "Client not found" })
    }

    // Calculate total amount
    const totalAmount = items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0

    // Create estimation
    const estimation = new Estimation({
      title,
      description,
      client: clientId,
      items: items || [],
      totalAmount,
      status: status || "draft",
      createdBy: req.user._id,
      history: [
        {
          action: "created",
          description: "created this estimation",
          user: req.user._id,
        },
      ],
    })

    await estimation.save()

    // Populate client details for response
    await estimation.populate("client")
    await estimation.populate("history.user", "name")

    res.status(201).json(estimation)
  } catch (error) {
    next(error)
  }
})

// Update estimation
router.put("/:id", async (req, res, next) => {
  try {
    const { title, description, clientId, items } = req.body

    // Find the estimation
    const estimation = await Estimation.findById(req.params.id)

    if (!estimation || estimation.status === "deleted") {
      return res.status(404).json({ error: "Estimation not found" })
    }

    // Only allow updating draft estimations
    if (estimation.status !== "draft") {
      return res.status(400).json({ error: "Only draft estimations can be updated" })
    }

    if (!title) {
      return res.status(400).json({ error: "Title is required" })
    }

    if (!clientId) {
      return res.status(400).json({ error: "Client is required" })
    }

    // Verify client exists
    const client = await Client.findById(clientId)
    if (!client) {
      return res.status(404).json({ error: "Client not found" })
    }

    // Calculate total amount
    const totalAmount = items?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0

    // Update fields
    estimation.title = title
    estimation.description = description
    estimation.client = clientId
    estimation.items = items || []
    estimation.totalAmount = totalAmount

    // Add history entry
    estimation.history.push({
      action: "updated",
      description: "updated this estimation",
      user: req.user._id,
      details: { title, totalAmount },
    })

    await estimation.save()

    // Populate client details for response
    await estimation.populate("client")
    await estimation.populate("history.user", "name")

    res.json(estimation)
  } catch (error) {
    next(error)
  }
})

// Update estimation status
router.patch("/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body

    if (!["draft", "pending_approval", "approved", "archived", "deleted"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" })
    }

    // Find the estimation
    const estimation = await Estimation.findById(req.params.id)

    if (!estimation || estimation.status === "deleted") {
      return res.status(404).json({ error: "Estimation not found" })
    }

    // Prevent changing approved estimations except to archived or deleted
    if (estimation.status === "approved" && !["archived", "deleted"].includes(status)) {
      return res.status(400).json({ error: "Approved estimations can only be archived or deleted" })
    }

    // Add appropriate history entry and update fields
    let action = "status_changed"
    let description = `changed status from ${estimation.status} to ${status}`

    if (status === "approved") {
      action = "approved"
      description = "approved this estimation"
      estimation.approvedBy = req.user._id
    } else if (status === "archived") {
      action = "archived"
      description = "archived this estimation"
    }

    estimation.status = status
    estimation.history.push({
      action,
      description,
      user: req.user._id,
    })

    await estimation.save()

    // Populate client details for response
    await estimation.populate("client")
    await estimation.populate("history.user", "name")

    res.json(estimation)
  } catch (error) {
    next(error)
  }
})

module.exports = router

