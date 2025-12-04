import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, signInWithPopup, type Auth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
)

const getAuthInstance = (): Auth => {
  if (!hasFirebaseConfig) {
    throw new Error("Firebase is not configured")
  }
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  return getAuth(app)
}

export const signInWithGoogleFirebase = async (): Promise<{ idToken: string }> => {
  const auth = getAuthInstance()
  const provider = new GoogleAuthProvider()
  const credential = await signInWithPopup(auth, provider)
  const idToken = await credential.user.getIdToken()
  return { idToken }
}
