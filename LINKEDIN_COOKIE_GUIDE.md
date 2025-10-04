# 🍪 How to Get Your LinkedIn Cookie

To use the LinkedIn features of this system, you need to provide your LinkedIn session cookie (`li_at`).

## 🔐 Why is this needed?

LinkedIn requires authentication to access profile data. Using your cookie allows the system to act on your behalf.

## 📋 Step-by-Step Guide

### 1. Open LinkedIn in Chrome/Edge

1. Go to [https://www.linkedin.com](https://www.linkedin.com)
2. Log in to your account

### 2. Open Developer Tools

- **Windows/Linux**: Press `F12` or `Ctrl + Shift + I`
- **Mac**: Press `Cmd + Option + I`

### 3. Navigate to Application/Storage Tab

1. In Developer Tools, click on the **Application** tab (Chrome) or **Storage** tab (Firefox)
2. In the left sidebar, expand **Cookies**
3. Click on `https://www.linkedin.com`

### 4. Find the `li_at` Cookie

1. In the cookies list, look for a cookie named **`li_at`**
2. Click on it to see its details
3. Copy the **Value** field (it's a long string of characters)

### 5. Add to the System

#### Option A: Via Web Interface
1. Open the web interface at http://localhost:3000
2. Go to Settings section
3. Paste the cookie value in the "LinkedIn Cookie" field
4. Click Save

#### Option B: Via .env File
1. Open the `.env` file in the project directory
2. Find the line `LINKEDIN_COOKIE=YOUR_LINKEDIN_COOKIE_HERE`
3. Replace `YOUR_LINKEDIN_COOKIE_HERE` with your cookie value
4. Save the file and restart the server

## ⚠️ Important Notes

- **Security**: Keep your cookie private! It provides access to your LinkedIn account
- **Expiration**: Cookies expire after some time (usually 1-2 months). You'll need to update it when it expires
- **Rate Limits**: LinkedIn has rate limits. The system includes delays to avoid detection
- **Terms of Service**: Use responsibly and in accordance with LinkedIn's terms of service

## 🔄 Cookie Expired?

If you get authentication errors:
1. Log out and log back into LinkedIn
2. Get the new `li_at` cookie value
3. Update it in the system

## 🎥 Video Tutorial

For a visual guide, search for "How to get LinkedIn li_at cookie" on YouTube.
