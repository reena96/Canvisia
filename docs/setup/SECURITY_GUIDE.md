# Security Guide: Environment Variables & Secrets Management

## Quick Start

### 1. Set Up Local Environment Variables

```bash
# Copy the template
cp .env.example .env.local

# Edit .env.local with your actual keys
# (Use your favorite editor)
nano .env.local
```

### 2. Verify .env.local is Ignored

```bash
# This should show that .env.local is ignored
git status

# If .env.local appears as "untracked", something is wrong!
# Check your .gitignore file
```

### 3. Never Commit Secrets

```bash
# ❌ BAD - This would commit your secrets
git add .env.local

# ✅ GOOD - .env.local is automatically ignored
git add .
```

---

## Understanding Environment Variables

### What Gets Exposed in Client-Side Code?

In Vite (and most modern bundlers), only variables prefixed with `VITE_` are exposed to the browser:

```javascript
// ✅ SAFE - Accessible in browser
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY

// ❌ NOT ACCESSIBLE - Server-side only
const secret = import.meta.env.CLAUDE_API_KEY  // undefined in browser
```

### Vite Environment Variable Rules

1. **`VITE_` prefix** → Exposed to browser (public)
2. **No prefix** → Server-side only (private)

---

## Firebase API Keys: Are They Really Secret?

### Short Answer: Firebase Web API Keys are Safe to Expose

Firebase web API keys in client-side code are **intentionally public**. They:
- ✅ Identify your Firebase project
- ✅ Are required for Firebase SDK to work
- ✅ **Cannot** be used to access your data without proper security rules
- ✅ **Cannot** be used to impersonate users

**Source:** [Firebase API Key Security](https://firebase.google.com/docs/projects/api-keys#api-keys-for-firebase-are-different)

### What Actually Protects Your Data?

Firebase Security Rules:

```javascript
// Example: Only authenticated users can read/write
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /canvases/{canvasId}/objects/{objectId} {
      // ✅ Users must be signed in
      allow read, write: if request.auth != null;
    }
  }
}
```

**Important:** Even with exposed API keys, your data is safe if security rules are configured correctly.

---

## Anthropic Claude API Key: This IS Secret

### ⚠️ CRITICAL: Claude API Keys Must Be Protected

Unlike Firebase, Claude API keys:
- ❌ Should **NEVER** be exposed in client-side code
- ❌ Can be used to make API calls that charge your account
- ❌ Have no built-in security rules

### Solution: API Route Pattern

**❌ BAD - Never do this:**
```tsx
// In React component (client-side)
const response = await fetch('https://api.anthropic.com/v1/messages', {
  headers: {
    'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY  // ❌ EXPOSED!
  }
})
```

**✅ GOOD - Use a server-side API route:**
```tsx
// Client-side: Call your own API
const response = await fetch('/api/ai/execute-command', {
  method: 'POST',
  body: JSON.stringify({ command: 'create a red circle' })
})

// Server-side (Vercel Serverless Function): /api/ai/execute-command.ts
export default async function handler(req, res) {
  const claudeApiKey = process.env.CLAUDE_API_KEY  // ✅ Server-side only!

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    headers: {
      'x-api-key': claudeApiKey  // ✅ Safe!
    },
    body: JSON.stringify({ /* ... */ })
  })

  res.json(await response.json())
}
```

---

## File Structure for Secrets

### What Should Exist in Your Repo

```
canvisia/
├── .env.example          ✅ Committed (template with placeholders)
├── .env.local            ❌ Never committed (your actual secrets)
├── .env.development      ❌ Never committed (optional dev config)
├── .env.production       ❌ Never committed (optional prod config)
├── .gitignore            ✅ Committed (includes .env* files)
└── SECURITY_GUIDE.md     ✅ Committed (this file)
```

### .gitignore Configuration

Your `.gitignore` already includes:

```gitignore
# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local
.env
```

**Why `.env` is also ignored:**
Some tools use `.env` instead of `.env.local`. This catches all variations.

---

## Setting Up for Different Environments

### Local Development

```bash
# .env.local
VITE_FIREBASE_API_KEY=your-dev-key
VITE_CLAUDE_API_KEY=sk-ant-api03-dev-key
VITE_ENV=development
VITE_DEBUG=true
```

### Testing with Firebase Emulators

```bash
# .env.test.local
VITE_USE_EMULATOR=true
VITE_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
VITE_FIREBASE_FIRESTORE_EMULATOR_HOST=localhost:8080
VITE_FIREBASE_RTDB_EMULATOR_HOST=localhost:9000
```

### Production (Vercel)

**Don't use .env files for production!** Instead:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable:
   - `VITE_FIREBASE_API_KEY` → your production Firebase key
   - `CLAUDE_API_KEY` → your Claude API key (no `VITE_` prefix!)
   - `VITE_APP_URL` → https://canvisia.vercel.app

**Why this is better:**
- ✅ Secrets never touch your codebase
- ✅ Different values for preview vs production
- ✅ Team members can't accidentally leak secrets

---

## Common Security Mistakes

### ❌ Mistake 1: Committing .env.local

```bash
# You accidentally did:
git add .env.local
git commit -m "Add config"
git push

# 🚨 YOUR SECRETS ARE NOW PUBLIC! 🚨
```

**Fix:**
1. Immediately rotate all API keys (Firebase, Claude, etc.)
2. Remove the file from git history:
   ```bash
   git rm --cached .env.local
   git commit -m "Remove secrets from git"
   git push
   ```
3. Consider using [git-secrets](https://github.com/awslabs/git-secrets) to prevent this

### ❌ Mistake 2: Exposing Claude API Key in Client

```tsx
// ❌ This exposes your API key in the browser
const CLAUDE_KEY = import.meta.env.VITE_CLAUDE_API_KEY
```

**Fix:** Remove `VITE_` prefix, use server-side API route instead.

### ❌ Mistake 3: Hardcoding Secrets

```tsx
// ❌ Never hardcode secrets
const firebaseConfig = {
  apiKey: "AIzaSyDUmN5eX4mPl3K..." // ❌ Bad!
}
```

**Fix:** Always use environment variables:
```tsx
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY // ✅ Good!
}
```

### ❌ Mistake 4: Sharing .env.local Files

**Someone asks:** "Can you send me your `.env.local` file?"

**Answer:** ❌ No! Instead:
1. Share `.env.example`
2. Tell them to copy it to `.env.local`
3. Help them get their own API keys

---

## Checking for Leaked Secrets

### Before Committing

```bash
# Show what will be committed
git diff --cached

# Look for patterns like:
# - apiKey: "AIza..."
# - sk-ant-api03-...
# - any hardcoded keys
```

### After Committing (Check History)

```bash
# Search git history for potential secrets
git log -S "sk-ant-api03" --all
git log -S "AIzaSy" --all

# If found: Rotate keys immediately!
```

### Use a Pre-commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Check for common secret patterns
if git diff --cached | grep -E "(sk-ant-api03|AIzaSy|firebase.*apiKey.*:.*\"[A-Za-z0-9])"; then
  echo "🚨 ERROR: Potential secret detected in commit!"
  echo "Please remove hardcoded secrets and use environment variables."
  exit 1
fi
```

---

## What to Do If Secrets Are Leaked

### 1. Rotate Keys Immediately

**Firebase:**
1. Firebase Console → Project Settings → Service Accounts
2. Generate new Web API key
3. Update `.env.local` and Vercel environment variables
4. (Old key stops working automatically after rotation)

**Claude API:**
1. https://console.anthropic.com/settings/keys
2. Delete compromised key
3. Generate new key
4. Update `.env.local` and Vercel environment variables

### 2. Remove from Git History

```bash
# Install BFG Repo Cleaner
brew install bfg

# Remove secrets from history
bfg --replace-text secrets.txt  # File with patterns to replace

# Force push (⚠️ coordinate with team!)
git push --force
```

### 3. Notify Your Team

Let your team know:
- Which keys were compromised
- New keys have been generated
- They need to update their `.env.local`

---

## Checklist: Before Going Live

- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.example` has placeholder values (no real secrets)
- [ ] Firebase security rules are configured
- [ ] Claude API key is server-side only (no `VITE_` prefix)
- [ ] Production secrets are in Vercel dashboard, not `.env` files
- [ ] No hardcoded secrets in source code
- [ ] Git history doesn't contain secrets (`git log -S "sk-ant-api03"`)
- [ ] Pre-commit hooks are set up (optional but recommended)

---

## Quick Reference

### Safe to Expose (Client-Side)
- ✅ `VITE_FIREBASE_API_KEY`
- ✅ `VITE_FIREBASE_AUTH_DOMAIN`
- ✅ `VITE_FIREBASE_PROJECT_ID`
- ✅ `VITE_FIREBASE_STORAGE_BUCKET`
- ✅ `VITE_FIREBASE_MESSAGING_SENDER_ID`
- ✅ `VITE_FIREBASE_APP_ID`
- ✅ `VITE_APP_URL`
- ✅ `VITE_ENV`

### Must Protect (Server-Side Only)
- ⚠️ `CLAUDE_API_KEY` (no `VITE_` prefix)
- ⚠️ Firebase Admin SDK private key (if used)
- ⚠️ Database connection strings
- ⚠️ OAuth client secrets

---

## Additional Resources

- [Firebase API Key Security](https://firebase.google.com/docs/projects/api-keys)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [OWASP Secrets Management](https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)

---

**Remember:** The best security is defense in depth:
1. ✅ Use `.gitignore` to prevent committing secrets
2. ✅ Use environment variables instead of hardcoding
3. ✅ Keep sensitive keys server-side only
4. ✅ Configure Firebase security rules
5. ✅ Use Vercel environment variables for production
6. ✅ Rotate keys if leaked
