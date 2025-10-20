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
    console.log('[Firebase] Connecting to emulators (Firestore and RTDB only)...')

    // Note: We do NOT connect to Auth emulator because Google OAuth doesn't work with it.
    // Auth will use production Firebase Auth for Google sign-in to work.
    // If you need to test with Auth emulator, use email/password or custom tokens instead.

    connectFirestoreEmulator(db, 'localhost', 8180)
    connectDatabaseEmulator(rtdb, 'localhost', 9100)
    console.log('[Firebase] ✅ Connected to emulators (Firestore:8180, RTDB:9100)')
    console.log('[Firebase] ℹ️ Using production Auth for Google sign-in')
  } catch (error) {
    // Ignore if already connected (this is expected on hot reload)
    console.log('[Firebase] Emulator connection error (may already be connected):', error)
  }
}

export { app }
