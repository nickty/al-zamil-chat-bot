const express = require("express")
const { authMiddleware, adminMiddleware } = require("../middleware/auth")
const { User } = require("../models/user")

const router = express.Router()

// Apply auth middleware to all routes
router.use(authMiddleware)
// Apply admin middleware to all routes
router.use(adminMiddleware)

// Get all users
router.get("/", async (req, res, next) => {
  try {
    const users = await User.find(
      {},
      {
        _id: 1,
        email: 1,
        name: 1,
        picture: 1,
        role: 1,
        suspended: 1,
        lastLogin: 1,
        createdAt: 1,
      },
    ).sort({ createdAt: -1 })

    res.json(users)
  } catch (error) {
    next(error)
  }
})

// Get user by ID
router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id, {
      _id: 1,
      email: 1,
      name: 1,
      picture: 1,
      role: 1,
      suspended: 1,
      lastLogin: 1,
      createdAt: 1,
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
})

// Update user suspension status
router.patch("/:id/suspend", async (req, res, next) => {
  try {
    const { suspended } = req.body

    if (typeof suspended !== "boolean") {
      return res.status(400).json({ error: "Suspended status must be a boolean" })
    }

    // Prevent suspending yourself
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot suspend your own account" })
    }

    const user = await User.findByIdAndUpdate(req.params.id, { suspended }, { new: true })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
})

// Update user role
router.patch("/:id/role", async (req, res, next) => {
  try {
    const { role } = req.body

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Role must be either 'user' or 'admin'" })
    }

    // Prevent changing your own role
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ error: "You cannot change your own role" })
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
})

module.exports = router

