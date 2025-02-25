function errorHandler(err, req, res, next) {
  console.error(err.stack)

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation Error",
      details: Object.values(err.errors).map((e) => e.message),
    })
  }

  if (err.code === 11000) {
    return res.status(400).json({
      message: "Duplicate key error",
      details: err.keyValue,
    })
  }

  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
}

module.exports = { errorHandler }

