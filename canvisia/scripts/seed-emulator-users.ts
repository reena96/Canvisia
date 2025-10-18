/**
 * Seed Firebase Auth Emulator with test users for local development
 * Run with: npm run seed-users
 */

const EMULATOR_AUTH_URL = 'http://localhost:9099'

interface TestUser {
  email: string
  password: string
  displayName: string
  photoURL?: string
}

const TEST_USERS: TestUser[] = [
  {
    email: 'Alice@test.com',
    password: 'password123',
    displayName: 'Alice',
    photoURL: 'https://i.pravatar.cc/150?img=1',
  },
  {
    email: 'bob@test.com',
    password: 'password123',
    displayName: 'Bob',
    photoURL: 'https://i.pravatar.cc/150?img=12',
  },
  {
    email: 'charlie@test.com',
    password: 'password123',
    displayName: 'Charlie',
    photoURL: 'https://i.pravatar.cc/150?img=33',
  },
]

async function seedUsers() {
  console.log('🌱 Seeding Firebase Auth Emulator with test users...\n')

  for (const user of TEST_USERS) {
    try {
      const response = await fetch(
        `${EMULATOR_AUTH_URL}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            password: user.password,
            displayName: user.displayName,
            photoUrl: user.photoURL,
            returnSecureToken: true,
          }),
        }
      )

      if (response.ok) {
        console.log(`✅ Created user: ${user.displayName} (${user.email})`)
      } else {
        const error = await response.json()
        if (error.error?.message === 'EMAIL_EXISTS') {
          console.log(`⏭️  User already exists: ${user.displayName}`)
        } else {
          console.error(`❌ Failed to create ${user.email}:`, error)
        }
      }
    } catch (error) {
      console.error(`❌ Error creating ${user.email}:`, error)
    }
  }

  console.log('\n✨ Seeding complete!')
  console.log('\n📝 Test user credentials:')
  TEST_USERS.forEach((user) => {
    console.log(`   ${user.displayName}: ${user.email} / ${user.password}`)
  })
}

seedUsers()
