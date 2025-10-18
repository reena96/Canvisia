# Dev Login Setup for Production Testing

## Overview

The Dev Login component provides quick access to test users for development and testing purposes.

## Enabling Dev Login in Production

### Step 1: Set Environment Variable

Add the following to your `.env.local` or production environment variables:

```bash
VITE_ENABLE_DEV_LOGIN=true
```

### Step 2: Create Test Users in Production Firebase

You need to manually create the test users in Firebase Authentication:

#### Option A: Use Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** > **Users**
4. Click **Add User** for each test user:

| Email | Password | Display Name |
|-------|----------|--------------|
| alice@test.com | password123 | Alice |
| bob@test.com | password123 | Bob |
| charlie@test.com | password123 | Charlie |
| diana@test.com | password123 | Diana |
| eve@test.com | password123 | Eve |
| frank@test.com | password123 | Frank |

#### Option B: Use the Setup Script

```bash
# Load environment variables and run setup script
npx tsx scripts/setup-test-users.ts
```

**Note**: This script needs to be run manually as it requires Firebase Admin SDK or production credentials.

### Step 3: Deploy with Dev Login Enabled

```bash
# Build with dev login enabled
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## Security Considerations

⚠️ **Important**: Dev login should ONLY be enabled for:
- Staging environments
- Internal testing
- Demo deployments

**DO NOT** enable dev login on production with real user data!

## Disabling Dev Login

To disable dev login in production:

1. Remove `VITE_ENABLE_DEV_LOGIN=true` from your environment variables
2. Rebuild and redeploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Test Users

All test users have the password: `password123`

- **Alice** - Red (#EF4444)
- **Bob** - Blue (#3B82F6)
- **Charlie** - Green (#10B981)
- **Diana** - Purple (#8B5CF6)
- **Eve** - Pink (#EC4899)
- **Frank** - Orange (#F59E0B)

## How It Works

The Dev Login component checks:
1. `import.meta.env.DEV` - Automatically shown in development mode
2. `import.meta.env.VITE_ENABLE_DEV_LOGIN === 'true'` - Can be enabled in production

When enabled, a "🔧 Dev Login" button appears on the login screen, allowing quick access to test accounts.
