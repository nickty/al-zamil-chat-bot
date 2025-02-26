const admin = require("firebase-admin")

// Initialize Firebase Admin with service account
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
const serviceAccount = require("../../serviceAccountKey.json");

if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    })
  }

module.exports = admin

