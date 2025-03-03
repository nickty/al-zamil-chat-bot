const multer = require("multer")

// Configure multer to store files in memory
const storage = multer.memoryStorage()

// File filter function
const fileFilter = (req, file, cb) => {
  // Allow CAD files and common engineering drawing formats
  const allowedTypes = [
    "application/acad", // AutoCAD
    "image/vnd.dxf", // DXF
    "application/dxf", // DXF
    "application/dwg", // DWG
    "image/x-dwg", // DWG
    "application/pdf", // PDF
    "image/jpeg", // JPEG
    "image/png", // PNG
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Invalid file type. Only CAD files (DWG, DXF), PDFs, and images are allowed."), false)
  }
}

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

module.exports = { upload }

