const express = require("express")
const { authMiddleware } = require("../middleware/auth")
const { Client } = require("../models/client")

const router = express.Router()

// Apply auth middleware to all routes
router.use(authMiddleware)

// Get all clients
router.get("/", async (req, res, next) => {
  try {
    const clients = await Client.find()
    res.json(clients)
  } catch (error) {
    next(error)
  }
})

// Get client by ID
router.get("/:id", async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id)
    if (!client) {
      return res.status(404).json({ error: "Client not found" })
    }
    res.json(client)
  } catch (error) {
    next(error)
  }
})

// Create new client
router.post("/", async (req, res, next) => {
  try {
    const { name, contactPerson, email, phone, address } = req.body

    if (!name) {
      return res.status(400).json({ error: "Client name is required" })
    }

    const client = await Client.create({
      name,
      contactPerson,
      email,
      phone,
      address,
      createdBy: req.user._id,
    })

    res.status(201).json(client)
  } catch (error) {
    next(error)
  }
})

// Update client
router.put("/:id", async (req, res, next) => {
  try {
    const { name, contactPerson, email, phone, address } = req.body

    if (!name) {
      return res.status(400).json({ error: "Client name is required" })
    }

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      {
        name,
        contactPerson,
        email,
        phone,
        address,
        updatedAt: Date.now(),
      },
      { new: true },
    )

    if (!client) {
      return res.status(404).json({ error: "Client not found" })
    }

    res.json(client)
  } catch (error) {
    next(error)
  }
})

// Delete client
router.delete("/:id", async (req, res, next) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id)

    if (!client) {
      return res.status(404).json({ error: "Client not found" })
    }

    res.json({ message: "Client deleted successfully" })
  } catch (error) {
    next(error)
  }
})

module.exports = router

