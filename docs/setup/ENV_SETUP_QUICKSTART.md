# Environment Variables - Quick Start

## 30-Second Setup

```bash
# 1. Copy the template
cp .env.example .env.local

# 2. Edit with your keys
nano .env.local

# 3. Verify it's ignored
git status  # .env.local should NOT appear
```

## What You Need

### Firebase (Get from Firebase Console)
1. Go to: https://console.firebase.google.com
2. Select your project → Settings ⚙️ → General
3. Scroll to "Your apps" → Web app config
4. Copy these to `.env.local`:
   ```bash
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

### Claude API (Get from Anthropic Console)
1. Go to: https://console.anthropic.com/settings/keys
2. Create a new API key
3. Copy to `.env.local`:
   ```bash
   VITE_CLAUDE_API_KEY=sk-ant-api03-...
   ```

## Using in Code

### Firebase Config (client-side)
```typescript
// src/config/firebase.config.ts
import { initializeApp } from 'firebase/app'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
```

### Claude API (server-side only!)
```typescript
// api/ai/execute-command.ts (Vercel serverless function)
const claudeApiKey = process.env.CLAUDE_API_KEY  // NO VITE_ prefix!

const response = await fetch('https://api.anthropic.com/v1/messages', {
  headers: {
    'x-api-key': claudeApiKey,
    'anthropic-version': '2023-06-01',
    'content-type': 'application/json',
  },
  // ...
})
```

## Common Mistakes

### ❌ Mistake: Committing .env.local
```bash
git add .env.local  # ❌ Git will warn you!
```

**Fix:** It's already in `.gitignore` - you can't commit it even if you try.

### ❌ Mistake: Exposing Claude key in client
```typescript
// ❌ BAD - Exposes API key in browser
const key = import.meta.env.VITE_CLAUDE_API_KEY
```

**Fix:** Remove `VITE_` prefix, use server-side API route instead.

### ❌ Mistake: Hardcoding keys
```typescript
// ❌ BAD
const apiKey = "AIzaSyDUmN5eX4mPl3K..."
```

**Fix:** Always use `import.meta.env.VITE_*`

## Checklist

Before starting development:
- [ ] Copied `.env.example` to `.env.local`
- [ ] Added Firebase config keys
- [ ] Added Claude API key
- [ ] Verified `.env.local` doesn't appear in `git status`
- [ ] Tested that Firebase initializes without errors

Before deploying to production:
- [ ] Added environment variables in Vercel dashboard
- [ ] Removed `VITE_` prefix from `CLAUDE_API_KEY` in Vercel
- [ ] Tested that `.env.local` is not in git history
- [ ] Verified Firebase security rules are configured

## Need More Info?

- **Full security guide:** `cat SECURITY_GUIDE.md`
- **Example template:** `cat .env.example`
- **Git protection demo:** Already verified ✅

## Quick Test

```bash
# This should work
cp .env.example .env.local
echo "VITE_TEST=hello" >> .env.local
git status
# .env.local should NOT appear!

# Clean up
rm .env.local
```

---

**Remember:** `.env.local` = your secrets, never committed to git! 🔒
