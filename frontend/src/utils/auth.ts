import { GoogleAuthProvider, signInWithPopup, getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"
import { app } from "./firebase"

export interface User {
  id: string
  name: string
  email: string
  picture: string
}

let currentUser: User | null = null
let authToken: string | null = null

export function getCurrentUser() {
  return currentUser
}

export function getAuthToken() {
  return authToken
}

export async function signInWithGoogle(): Promise<User> {
  try {
    const auth = getAuth(app)
    // Set persistence to LOCAL to maintain the session
    await setPersistence(auth, browserLocalPersistence)

    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: "select_account",
    })

    // Use try-catch specifically for the popup
    try {
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: idToken }),
      })

      if (!response.ok) {
        throw new Error("Failed to verify token")
      }

      const data = await response.json()
      currentUser = data.user
      authToken = idToken

      // Instead of using window.location, return success
      return data.user
    } catch (popupError) {
      console.error("Popup error:", popupError)
      throw new Error("Failed to sign in with popup")
    }
  } catch (error) {
    console.error("Sign in error:", error)
    currentUser = null
    authToken = null
    throw error
  }
}

export async function signOut() {
  const auth = getAuth(app)
  try {
    await auth.signOut()
    currentUser = null
    authToken = null
    // Let the component handle navigation
  } catch (error) {
    console.error("Sign out error:", error)
    throw error
  }
}

