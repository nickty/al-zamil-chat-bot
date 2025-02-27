const express = require("express")
const admin = require("../config/firebase-admin")
const { User } = require("../models/user")
const router = express.Router()

router.post("/verify-token", async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        message: "Token is required",
        code: "auth/no-token",
      })
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token)

      // Check token expiration with 5-minute buffer
      const tokenExp = decodedToken.exp * 1000
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000

      if (tokenExp < now + fiveMinutes) {
        return res.status(401).json({
          message: "Token expired or about to expire",
          code: "auth/id-token-expired",
        })
      }

      let user = await User.findOne({ googleId: decodedToken.sub })

      if (!user) {
        user = await User.create({
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture,
          googleId: decodedToken.sub,
        })
      } else {
        // Update user info if changed
        if (
          user.email !== decodedToken.email ||
          user.name !== decodedToken.name ||
          user.picture !== decodedToken.picture
        ) {
          user.email = decodedToken.email
          user.name = decodedToken.name
          user.picture = decodedToken.picture
          await user.save()
        }
      }

      res.json({
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture,
          role: user.role, // Add this line
        },
      })
    } catch (verifyError) {
      console.error("Token verification failed:", verifyError)

      if (verifyError.code === "auth/id-token-expired") {
        return res.status(401).json({
          message: "Token expired",
          code: "auth/id-token-expired",
        })
      }

      return res.status(401).json({
        message: "Invalid token",
        code: "auth/invalid-token",
      })
    }
  } catch (error) {
    console.error("Auth error:", error)
    res.status(500).json({
      message: "Internal server error",
      code: "auth/server-error",
    })
  }
})

module.exports = { authRouter: router }

