import { initializeApp, getApps } from "firebase/app"
import { getStorage } from "firebase/storage"

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// }

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// }

const firebaseConfig = {
    apiKey: "AIzaSyBQTrNHxkEV0JGJ87xiWuZq3-1C5m9FVlc",
    authDomain: "zhi-assistant-453d0.firebaseapp.com",
    projectId: "zhi-assistant-453d0",
    storageBucket: "zhi-assistant-453d0.firebasestorage.app",
    messagingSenderId: "1059535786942",
    appId: "1:1059535786942:web:c64fd7689920928ca95fef",
    measurementId: "G-7LT27C9VHH"
  };

// export const app = initializeApp(firebaseConfig)

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

const storage = getStorage(app)

export { app, storage }

