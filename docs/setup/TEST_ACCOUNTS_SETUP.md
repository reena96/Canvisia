# Production Test Accounts Setup

This guide explains how to set up test accounts for production testing.

## Overview

We have 3 test accounts that allow you to quickly login to production without using your personal Google account:

- **alice.test@canvisia.app** - Alice (Blue cursor)
- **bob.test@canvisia.app** - Bob (Red cursor)
- **charlie.test@canvisia.app** - Charlie (Green cursor)

All accounts use the password: `TestUser123!`

## Initial Setup

### Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (canvisia-ab47b)
3. Click the gear icon ⚙️ next to "Project Overview"
4. Go to "Project settings"
5. Click on the "Service accounts" tab
6. Click "Generate new private key"
7. Save the downloaded JSON file as `serviceAccountKey.json` in the project root

⚠️ **Important**: This file contains sensitive credentials. It's already in `.gitignore` - never commit it!

### Step 2: Create the Test Accounts

Run the setup script:

```bash
npx tsx scripts/setup-prod-test-users.ts
```

This will:
- Create 3 test user accounts in Firebase Authentication
- Set their passwords to `TestUser123!`
- Mark them as email verified

### Step 3: Deploy to Production

The ProductionTestLogin component is already integrated and will show up on the production login page.

```bash
npm run build
firebase deploy --only hosting
```

## Using Test Accounts

### In Production

1. Visit https://canvisia-ab47b.web.app
2. Click "🧪 Test Account Login"
3. Choose Alice, Bob, or Charlie
4. You're logged in!

### In Development

In development mode (localhost), you'll see the "🔧 Dev Login" button instead, which uses the emulator test accounts.

## Security Notes

- These accounts only exist for testing in production
- They use the `@canvisia.app` domain to clearly identify them as test accounts
- The service account key should never be committed to version control
- In a real production environment, consider:
  - Using Firebase Test Lab
  - Setting up a separate staging environment
  - Using email authentication with known test emails

## Troubleshooting

### "User already exists" error

The script will automatically update existing users, so you can run it multiple times safely.

### "serviceAccountKey.json not found"

Make sure you've downloaded the service account key from Firebase Console and placed it in the project root.

### Can't login with test account

1. Check that the account was created in Firebase Console > Authentication
2. Verify the password is `TestUser123!`
3. Check browser console for errors
4. Make sure you're not in emulator mode (use production URL)

## Removing Test Accounts

To remove test accounts:

1. Go to Firebase Console > Authentication
2. Find the test accounts (alice.test@canvisia.app, etc.)
3. Click the ⋮ menu and select "Delete user"

Or use Firebase CLI:

```bash
firebase auth:delete alice.test@canvisia.app
firebase auth:delete bob.test@canvisia.app
firebase auth:delete charlie.test@canvisia.app
```
