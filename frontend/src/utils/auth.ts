import { GoogleAuthProvider, signInWithPopup, getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"
import { app } from "./firebase"

export interface User {
  id: string
  name: string
  email: string
  picture: string
}

const AUTH_KEY = "zhi_auth_user"
const TOKEN_KEY = "zhi_auth_token"

export function getCurrentUser(): User | null {
  const stored = localStorage.getItem(AUTH_KEY)
  return stored ? JSON.parse(stored) : null
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setCurrentUser(user: User | null, token: string | null) {
  if (user && token) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(AUTH_KEY)
    localStorage.removeItem(TOKEN_KEY)
  }
}

export async function refreshAuthToken(): Promise<string | null> {
  try {
    const auth = getAuth(app)
    const currentUser = auth.currentUser

    if (!currentUser) {
      throw new Error("No user signed in")
    }

    const idToken = await currentUser.getIdToken(true) // Force refresh

    // Verify the new token with backend
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
    setCurrentUser(data.user, idToken)
    return idToken
  } catch (error) {
    console.error("Token refresh error:", error)
    return null
  }
}

export async function signInWithGoogle(): Promise<User> {
  try {
    const auth = getAuth(app)
    await setPersistence(auth, browserLocalPersistence)

    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: "select_account",
    })

    const result = await signInWithPopup(auth, provider)
    const idToken = await result.user.getIdToken()

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
    setCurrentUser(data.user, idToken)
    return data.user
  } catch (error) {
    console.error("Sign in error:", error)
    setCurrentUser(null, null)
    throw error
  }
}

export async function signOut() {
  const auth = getAuth(app)
  try {
    await auth.signOut()
    setCurrentUser(null, null)
  } catch (error) {
    console.error("Sign out error:", error)
    throw error
  }
}

