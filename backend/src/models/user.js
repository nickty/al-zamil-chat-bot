const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  picture: String,
  googleId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
})

const User = mongoose.model("User", userSchema)

module.exports = { User }

