const express = require("express")
const admin = require("../config/firebase-admin")
const { User } = require("../models/user")
const router = express.Router()

router.post("/verify-token", async (req, res) => {
  try {
    const { token } = req.body
    if (!token) {
      return res.status(400).json({ message: "Token is required" })
    }

    const decodedToken = await admin.auth().verifyIdToken(token)

    let user = await User.findOne({ googleId: decodedToken.sub })

    if (!user) {
      user = await User.create({
        email: decodedToken.email,
        name: decodedToken.name,
        picture: decodedToken.picture,
        googleId: decodedToken.sub,
      })
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    })
  } catch (error) {
    console.error("Auth error:", error)
    res.status(401).json({ message: "Invalid token" })
  }
})

module.exports = { authRouter: router }

