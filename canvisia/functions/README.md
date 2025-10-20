# Canvisia Cloud Functions

This directory contains Firebase Cloud Functions for Canvisia.

## Functions

### `sendInvitationEmail`
Automatically sends an email invitation when a user is invited to collaborate on a project.

**Trigger:** Firestore document creation in `permissions/{permissionId}`

**What it does:**
1. Detects when a new permission document is created
2. Skips owner self-permissions (created during project creation)
3. Fetches project details and inviter information
4. Sends a beautifully formatted HTML email to the invited user
5. Includes a direct link to the project

## Setup

### 1. Install Dependencies
```bash
cd functions
npm install
```

### 2. Configure Email Settings

#### Option A: Gmail (Development/Testing)

1. **Create a Gmail App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Sign in to your Google Account
   - Create a new app password for "Canvisia"
   - Copy the 16-character password

2. **Create `.env.local` file:**
   ```bash
   cp .env.example .env.local
   ```

3. **Edit `.env.local` and add your credentials:**
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   APP_URL=http://localhost:5174
   ```

#### Option B: Production Email Service

For production, use a professional email service:

- **SendGrid** (Recommended): Free tier with 100 emails/day
- **AWS SES**: Very cheap, requires AWS account
- **Mailgun**: Good for transactional emails

Update `functions/index.js` to use your chosen service's SMTP configuration.

### 3. Test Locally with Emulators

1. **Start Firebase Emulators** (including functions):
   ```bash
   firebase emulators:start
   ```

2. **Invite a user** through the ShareDialog in the app

3. **Check function logs** in the Firebase Emulator UI:
   - Open http://localhost:4100
   - Go to "Functions" tab
   - View logs for `sendInvitationEmail`

### 4. Deploy to Production

```bash
# Set environment variables for production
firebase functions:config:set email.user="your-email@gmail.com"
firebase functions:config:set email.pass="your-app-password"
firebase functions:config:set app.url="https://your-domain.com"

# Deploy functions
firebase deploy --only functions
```

## Email Template

The invitation email includes:
- Branded header with Canvisia logo
- Inviter's name
- Project name
- Access level (Can edit / Can view)
- Direct link button to the project
- Responsive HTML design
- Plain text fallback

## Troubleshooting

### Emails not sending

1. **Check function logs** in Firebase Emulator UI
2. **Verify Gmail App Password** is correct
3. **Check spam folder** for invited user
4. **Ensure EMAIL_USER and EMAIL_PASS** are set in environment

### "Less secure app access" error

- Gmail now requires App Passwords, not your regular password
- Follow the setup instructions above to create an App Password

### Emails sent but not received

- Check spam/junk folder
- Verify the email address is correct
- Check Firebase Functions logs for errors

## Security Notes

- **Never commit `.env.local`** to version control (it's in .gitignore)
- Use App Passwords, not your main Google password
- For production, use environment variables via Firebase Functions config
- Consider using a dedicated email service account
