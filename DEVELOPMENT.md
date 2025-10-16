# Development Guide

## Testing Multiplayer Features Locally

### Prerequisites

Firebase Emulators require **Java 11 or higher**. Check if you have Java:
```bash
java -version
```

If not installed, install Java:
- **Mac**: `brew install openjdk@11`
- **Windows**: Download from https://adoptium.net/
- **Linux**: `sudo apt install openjdk-11-jre`

### Quick Start (Recommended)

1. **Start Firebase Emulators:**
   ```bash
   firebase emulators:start
   ```
   Wait for "All emulators ready!" message (usually ~10 seconds)

2. **In a new terminal, seed test users:**
   ```bash
   npm run seed-users
   ```

3. **In another terminal, start the dev server:**
   ```bash
   npm run dev
   ```

4. **Open multiple browser tabs:**
   - Open http://localhost:5173 in multiple tabs
   - Click on the colored buttons (Alice, Bob, Charlie) to login instantly
   - Move your mouse on the canvas - you'll see cursors appear in other tabs!

### Alternative: Use Multiple Browser Profiles

If you don't want to install Java, you can test with real Google accounts:

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open in different browser profiles:**
   - Chrome Profile 1: Sign in with Google Account A
   - Chrome Profile 2: Sign in with Google Account B
   - Or use Chrome + Firefox with different Google accounts

3. Test cursor synchronization between the profiles

### Test Users

Three pre-configured test accounts are available in the emulator:

| Name    | Email            | Password     | Cursor Color |
|---------|------------------|--------------|--------------|
| Alice   | alice@test.com   | password123  | Red          |
| Bob     | bob@test.com     | password123  | Teal         |
| Charlie | charlie@test.com | password123  | Blue         |

### Dev Login Component

When running locally with the emulator, a **"🔧 Dev Login"** panel appears in the top-right corner with quick login buttons for each test user. This only appears when:
- Running in development mode (`npm run dev`)
- Using Firebase emulator (not production)

### Testing Workflow

1. Open Tab 1 → Click "Alice" → Move mouse on canvas
2. Open Tab 2 → Click "Bob" → See Alice's cursor!
3. Open Tab 3 → Click "Charlie" → See both cursors!

### Emulator UI

Access the Firebase Emulator UI at http://localhost:4000 to:
- View authentication state
- Inspect Realtime Database data
- Clear test data

### Troubleshooting

**"Permission denied" errors:**
- Make sure you're logged in (check for colored button in dev panel)
- Check that emulators are running

**Cursors not appearing:**
- Verify you're signed in as different users in each tab
- Check browser console for errors (F12)
- Make sure Firebase emulators are running

**Emulator data persists:**
- Data is saved to `.emulator-data/` directory
- Delete this folder to reset all test data
