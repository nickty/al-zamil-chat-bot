const admin = require("../config/firebase-admin")
const { User } = require("../models/user")

// Export the middleware function directly
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1]

    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    try {
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

      req.user = user
      next()
    } catch (verifyError) {
      console.error("Token verification failed:", verifyError)
      return res.status(401).json({ message: "Invalid token" })
    }
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

// Export the middleware function as default
module.exports = authMiddleware

