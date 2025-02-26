const admin = require("../config/firebase-admin")
const { User } = require("../models/user")

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1]

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token)

      // Check token expiration
      const tokenExp = decodedToken.exp * 1000 // Convert to milliseconds
      const now = Date.now()

      if (tokenExp < now) {
        return res.status(401).json({
          message: "Token expired",
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
      }

      req.user = user
      next()
    } catch (verifyError) {
      console.error("Token verification failed:", verifyError)

      // Send specific error for expired tokens
      if (verifyError.code === "auth/id-token-expired") {
        return res.status(401).json({
          message: "Token expired",
          code: "auth/id-token-expired",
        })
      }

      return res.status(401).json({ message: "Invalid token" })
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

module.exports = authMiddleware

