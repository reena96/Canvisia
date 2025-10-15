/**
 * Script to create test users in production Firebase
 * Run with: npx tsx scripts/setup-prod-test-users.ts
 */

import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import * as fs from 'fs'
import * as path from 'path'

// Test user configuration
const TEST_USERS = [
  {
    email: 'alice.test@canvisia.app',
    displayName: 'Alice (Test)',
    password: 'TestUser123!',
  },
  {
    email: 'bob.test@canvisia.app',
    displayName: 'Bob (Test)',
    password: 'TestUser123!',
  },
  {
    email: 'charlie.test@canvisia.app',
    displayName: 'Charlie (Test)',
    password: 'TestUser123!',
  },
]

async function setupTestUsers() {
  console.log('🚀 Setting up production test users...\n')

  // Check for service account key
  const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json')

  if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Error: serviceAccountKey.json not found!')
    console.log('\nTo create test users, you need to:')
    console.log('1. Go to Firebase Console > Project Settings > Service Accounts')
    console.log('2. Click "Generate New Private Key"')
    console.log('3. Save the file as serviceAccountKey.json in the project root')
    console.log('4. Run this script again\n')
    process.exit(1)
  }

  try {
    // Initialize Firebase Admin
    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, 'utf8')
    ) as ServiceAccount

    initializeApp({
      credential: cert(serviceAccount),
    })

    const auth = getAuth()
    console.log('✅ Firebase Admin initialized\n')

    // Create or update each test user
    for (const user of TEST_USERS) {
      try {
        // Try to get existing user
        let userRecord
        try {
          userRecord = await auth.getUserByEmail(user.email)
          console.log(`ℹ️  User ${user.email} already exists, updating...`)

          // Update existing user
          userRecord = await auth.updateUser(userRecord.uid, {
            displayName: user.displayName,
            password: user.password,
          })
          console.log(`✅ Updated: ${user.displayName} (${user.email})`)
        } catch (error: any) {
          if (error.code === 'auth/user-not-found') {
            // Create new user
            userRecord = await auth.createUser({
              email: user.email,
              password: user.password,
              displayName: user.displayName,
              emailVerified: true, // Mark as verified so they can login immediately
            })
            console.log(`✅ Created: ${user.displayName} (${user.email})`)
          } else {
            throw error
          }
        }

        console.log(`   UID: ${userRecord.uid}`)
        console.log(`   Password: ${user.password}\n`)
      } catch (error: any) {
        console.error(`❌ Error with ${user.email}:`, error.message)
      }
    }

    console.log('\n✨ Test users setup complete!')
    console.log('\nYou can now login with any of these accounts:')
    TEST_USERS.forEach((user) => {
      console.log(`  • ${user.email} / ${user.password}`)
    })
    console.log('\n⚠️  Remember to keep serviceAccountKey.json secure and never commit it!')
  } catch (error: any) {
    console.error('❌ Failed to setup test users:', error.message)
    process.exit(1)
  }
}

setupTestUsers()
