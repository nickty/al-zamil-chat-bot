const multer = require("multer")

// Configure multer to store files in memory
const storage = multer.memoryStorage()

// File filter function
const fileFilter = (req, file, cb) => {
  // Allow CAD files, PDFs, and common image formats
  const allowedTypes = [
    "application/acad",
    "image/vnd.dxf",
    "application/dxf",
    "application/dwg",
    "image/x-dwg",
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
  ]

  // For files that might not have the exact MIME type
  const allowedExtensions = [".dwg", ".dxf", ".pdf", ".jpg", ".jpeg", ".png"]
  const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf("."))

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true)
  } else {
    cb(
      new Error(`Invalid file type: ${file.mimetype}. Only CAD files (DWG, DXF), PDFs, and images are allowed.`),
      false,
    )
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

