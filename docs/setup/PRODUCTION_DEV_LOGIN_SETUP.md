# Production Dev Login Setup

## Problem
Dev Login shows "Firebase: Error (auth/invalid-credential)" in production because test users don't exist in production Firebase Auth.

## Solution: Create Test Users in Firebase Console

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com
2. Select your project
3. Navigate to **Authentication** > **Users**

### Step 2: Add Each Test User
Click **Add User** and create these users:

| Email | Password | Display Name |
|-------|----------|--------------|
| alice@test.com | password123 | Alice |
| bob@test.com | password123 | Bob |
| charlie@test.com | password123 | Charlie |

**Important:** Use exactly these credentials - they're hardcoded in `DevLogin.tsx`

### Step 3: Verify Dev Login is Enabled
In your production `.env` or Firebase environment config:
```bash
VITE_ENABLE_DEV_LOGIN=true
```

### Step 4: Test
1. Open your production URL
2. Click "🔧 Dev Login"
3. Click "Alice (Test)"
4. Should log in successfully

## Alternative: Disable Dev Login in Production

If you don't want Dev Login in production:

### Option A: Remove Environment Variable
Remove `VITE_ENABLE_DEV_LOGIN=true` from production environment

### Option B: Update Code
In `DevLogin.tsx`, change line 50 to only show in development:
```typescript
if (!isDevelopment) return null
```

## Security Note
⚠️ **Only enable Dev Login for:**
- Staging environments
- Internal testing
- Demo deployments

**DO NOT** enable on production with real user data!
