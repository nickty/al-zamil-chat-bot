const admin = require("firebase-admin")

// Initialize Firebase Admin with service account
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
const serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

module.exports = admin

