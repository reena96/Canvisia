// Firebase Configuration
// Get config from environment variables (Vite uses VITE_ prefix)

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
}

// Validate config
export function validateFirebaseConfig() {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId']
  const missing = required.filter((key) => !firebaseConfig[key as keyof typeof firebaseConfig])

  if (missing.length > 0) {
    console.error('Missing Firebase config:', missing)
    return false
  }
  return true
}
