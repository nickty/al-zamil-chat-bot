const cloudinary = require("../config/cloudinary")
const { Readable } = require("stream")

async function uploadFile(file, userId) {
  try {
    console.log("Uploading file to storage:", file.originalname)

    if (!file || !file.buffer) {
      throw new Error("Invalid file object")
    }

    // Create a stream from the buffer
    const stream = Readable.from(file.buffer)

    // Create upload stream to Cloudinary
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `zhi-chatbot/${userId}`,
          resource_type: "auto",
          public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
        },
        (error, result) => {
          if (error) {
            console.error("Storage upload error:", error)
            reject(error)
            return
          }

          console.log("File uploaded successfully:", result.public_id)

          resolve({
            filename: result.public_id,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            storageUrl: result.secure_url,
          })
        },
      )

      stream.pipe(uploadStream)
    })
  } catch (error) {
    console.error("Error in uploadFile:", error)
    throw error
  }
}

async function deleteFile(publicId) {
  try {
    if (!publicId) {
      throw new Error("Public ID is required")
    }

    const result = await cloudinary.uploader.destroy(publicId)
    console.log(`Successfully deleted file: ${publicId}`)
    return result
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}

module.exports = { uploadFile, deleteFile }

