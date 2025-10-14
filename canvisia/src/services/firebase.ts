import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
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
export { app }
