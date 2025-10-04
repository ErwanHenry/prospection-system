# 📧 Gmail Configuration Guide for Prospection System

## 🎯 Problem Solved
The error `❌ Failed to initialize email service: Invalid login` occurs because Gmail authentication isn't properly configured.

## 🔧 Quick Fix Steps

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. This is **required** for App Passwords

### Step 2: Generate App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click **2-Step Verification**
3. Scroll down to **App passwords**
4. Click **Select app** → Choose **Mail**
5. Click **Select device** → Choose **Other** → Type "LinkedIn Prospection System"
6. Click **Generate**
7. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 3: Configure Environment Variables
Create or update your `.env` file in the project root:

```bash
# Gmail Configuration
GMAIL_USER=your.email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Example:
# GMAIL_USER=john.doe@gmail.com  
# GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

### Step 4: Restart the Server
```bash
# Stop current server
pkill -f "node server.js"

# Start server with new config
node server.js
```

## ✅ Verification

After restart, you should see:
```
✅ Email transporter configuré avec succès
```

Instead of:
```
❌ Failed to initialize email service: Invalid login
```

## 🚨 Common Issues & Solutions

### Issue 1: "Username and Password not accepted"
**Cause**: Using regular Gmail password instead of App Password
**Solution**: Use the 16-character App Password, not your regular Gmail password

### Issue 2: "Please log in via your web browser"
**Cause**: 2-Factor Authentication not enabled
**Solution**: Enable 2FA first, then generate App Password

### Issue 3: "App Password option not visible"
**Cause**: 2-Factor Authentication not fully activated
**Solution**: Wait 24 hours after enabling 2FA, then try again

### Issue 4: "Invalid credentials"
**Cause**: Spaces or special characters in App Password
**Solution**: Remove all spaces from App Password in .env file

## 🧪 Test Email Functionality

Once configured, you can test email sending:

```bash
curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "test@example.com", "subject": "Test", "message": "Hello!"}'
```

## 🔒 Security Best Practices

1. **Never commit .env file** to version control
2. **Use App Passwords only** - never your main Gmail password
3. **Rotate App Passwords** regularly (every 6 months)
4. **Revoke unused App Passwords** from Google Account settings

## 📱 Alternative: Using Other Email Providers

If you prefer not to use Gmail, you can configure other SMTP providers:

### Outlook/Hotmail:
```env
GMAIL_USER=your.email@outlook.com
GMAIL_APP_PASSWORD=your-outlook-app-password
# Update service in automationService.js to 'hotmail'
```

### Custom SMTP:
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your.email@domain.com
SMTP_PASS=your-password
```

## 🎯 What This Fixes

With proper Gmail configuration, your prospection system can:
- ✅ Send personalized emails to prospects
- ✅ Send follow-up emails automatically  
- ✅ Send workflow completion notifications
- ✅ Send system alerts and reports

## 🔗 Useful Links

- [Google App Passwords Guide](https://support.google.com/accounts/answer/185833)
- [2-Step Verification Setup](https://support.google.com/accounts/answer/185839)
- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)