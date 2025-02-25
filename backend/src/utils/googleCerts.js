const axios = require("axios")
const NodeCache = require("node-cache")

// Cache certificates for 6 hours
const certCache = new NodeCache({ stdTTL: 21600 })

async function getGoogleCerts() {
  try {
    // Try to get from cache first
    const cachedCerts = certCache.get("google-certs")
    if (cachedCerts) {
      console.log("Using cached certificates")
      return cachedCerts
    }

    console.log("Fetching fresh certificates from Google")
    const response = await axios.get("https://www.googleapis.com/oauth2/v3/certs")

    // Log the raw response for debugging
    console.log("Raw certificate response:", JSON.stringify(response.data, null, 2))

    if (!response.data.keys || !Array.isArray(response.data.keys)) {
      throw new Error("Invalid certificate format from Google")
    }

    // Create a map of kid to certificate
    const certs = {}
    for (const key of response.data.keys) {
      if (key.kid && key.n && key.e) {
        certs[key.kid] = {
          kty: key.kty,
          alg: key.alg,
          use: key.use,
          kid: key.kid,
          n: key.n,
          e: key.e,
        }
      }
    }

    // Log available key IDs
    console.log("Available certificate kids:", Object.keys(certs))

    // Cache the certificates
    certCache.set("google-certs", certs)
    return certs
  } catch (error) {
    console.error("Error fetching Google certificates:", error)
    throw error
  }
}

// Add a function to clear the cache if needed
function clearCertCache() {
  console.log("Clearing certificate cache")
  certCache.del("google-certs")
}

module.exports = { getGoogleCerts, clearCertCache }

