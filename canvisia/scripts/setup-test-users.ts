/**
 * Script to create test users in Firebase Authentication
 * Run with: npx tsx scripts/setup-test-users.ts
 */

import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { DEV_USER_COLORS } from '../src/config/userColors'

// Firebase config from .env.local
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

const TEST_USERS = DEV_USER_COLORS.map((userColor) => ({
  email: `${userColor.displayName.toLowerCase()}@test.com`,
  password: 'password123',
  displayName: userColor.displayName,
  color: userColor.color,
}))

async function setupTestUsers() {
  console.log('Setting up test users in Firebase Authentication...\n')

  for (const user of TEST_USERS) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      )

      await updateProfile(userCredential.user, {
        displayName: user.displayName,
      })

      console.log(`✅ Created user: ${user.displayName} (${user.email})`)
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  User already exists: ${user.displayName} (${user.email})`)
      } else {
        console.error(`❌ Failed to create ${user.displayName}:`, error.message)
      }
    }
  }

  console.log('\n✅ Test user setup complete!')
  process.exit(0)
}

setupTestUsers().catch((error) => {
  console.error('❌ Setup failed:', error)
  process.exit(1)
})
