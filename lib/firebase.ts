import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDJD_Ws0-J22Go8SJF0HHfUoyVC23Pyajc",
  authDomain: "citymate-1656a.firebaseapp.com",
  projectId: "citymate-1656a",
  storageBucket: "citymate-1656a.firebasestorage.app",
  messagingSenderId: "444662966864",
  appId: "1:444662966864:web:b8e6836b8c648311a6bf55",
}

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null
let initError: string | null = null

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  db = getFirestore(app)
  auth = getAuth(app)
} catch (error) {
  initError = error instanceof Error ? error.message : 'Failed to initialize Firebase'
  console.error('Firebase initialization error:', error)
}

export { app, db, auth, initError }
export default app
