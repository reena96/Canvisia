import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getDatabase, connectDatabaseEmulator } from 'firebase/database'
import { firebaseConfig, validateFirebaseConfig } from '@/config/firebase.config'

// Initialize Firebase (singleton pattern)
function initializeFirebase() {
  // Check if Firebase is already initialized
  if (getApps().length > 0) {
    return getApp()
  }

  // Validate config before initializing
  if (!validateFirebaseConfig()) {
    throw new Error('Invalid Firebase configuration. Please check your .env.local file.')
  }

  // Initialize Firebase
  return initializeApp(firebaseConfig)
}

// Initialize app
const app = initializeFirebase()

// Export Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const rtdb = getDatabase(app)

// Connect to emulators in development
if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, 'localhost', 8080)
    connectDatabaseEmulator(rtdb, 'localhost', 9000)
  } catch {
    // Ignore if already connected (this is expected on hot reload)
  }
}

export { app }
