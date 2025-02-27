const admin = require("../config/firebase-admin")
const { User } = require("../models/user")

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1]

    if (!token) {
      return res.status(401).json({
        message: "No token provided",
        code: "auth/no-token",
      })
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token)

      // Check token expiration with 5-minute buffer
      const tokenExp = decodedToken.exp * 1000 // Convert to milliseconds
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000

      if (tokenExp < now + fiveMinutes) {
        return res.status(401).json({
          message: "Token expired or about to expire",
          code: "auth/id-token-expired",
        })
      }

      // Find or create user
      let user = await User.findOne({ googleId: decodedToken.sub })

      if (!user) {
        user = await User.create({
          email: decodedToken.email,
          name: decodedToken.name,
          picture: decodedToken.picture,
          googleId: decodedToken.sub,
        })
      }

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

      req.user = user
      next()
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
    console.error("Auth middleware error:", error)
    res.status(500).json({
      message: "Internal server error",
      code: "auth/server-error",
    })
  }
}

module.exports = authMiddleware

