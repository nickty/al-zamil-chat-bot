const jwt = require("jsonwebtoken")
const { getGoogleCerts, clearCertCache } = require("./googleCerts")
const { createPublicKey } = require("crypto")

async function verifyGoogleToken(token) {
  try {
    // Decode the token without verification to get the key ID
    const decoded = jwt.decode(token, { complete: true })
    if (!decoded || !decoded.header || !decoded.header.kid) {
      throw new Error("Invalid token format")
    }

    console.log("Token kid:", decoded.header.kid)

    // Get the certificates
    let certs = await getGoogleCerts()
    let key = certs[decoded.header.kid]

    // If key not found, clear cache and try again
    if (!key) {
      console.log("Certificate not found in cache, refreshing...")
      clearCertCache()
      certs = await getGoogleCerts()
      key = certs[decoded.header.kid]
    }

    if (!key) {
      throw new Error(`No certificate found for kid: ${decoded.header.kid}`)
    }

    console.log("Found matching certificate:", key.kid)

    // Convert JWK to PEM
    try {
      const publicKey = createPublicKey({
        key: {
          kty: "RSA",
          n: key.n,
          e: key.e,
        },
        format: "jwk",
      })

      // Verify the token
      const verified = jwt.verify(token, publicKey.export({ type: "spki", format: "pem" }), {
        algorithms: ["RS256"],
        audience: process.env.GOOGLE_CLIENT_ID,
        issuer: ["https://accounts.google.com", "accounts.google.com"],
      })

      console.log("Token verified successfully")
      return verified
    } catch (cryptoError) {
      console.error("Error converting certificate or verifying token:", cryptoError)
      throw cryptoError
    }
  } catch (error) {
    console.error("Token verification error:", error)
    throw error
  }
}

module.exports = { verifyGoogleToken }

