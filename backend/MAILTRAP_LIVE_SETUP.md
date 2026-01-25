# Mailtrap Live Email Setup - Fix Domain Issue

## ❌ Current Problem

You're getting this error:
```
5.7.1 Sending from domain mailtrap.io is not allowed
```

This means you need to add a verified domain to Mailtrap first.

---

## ✅ Solution: Add Domain to Mailtrap

### Option 1: Use Your Own Domain (Recommended)

If you have a domain (e.g., `cibn.org` or `yourdomain.com`):

1. **Login to Mailtrap:** https://mailtrap.io/signin

2. **Go to Email Sending:**
   - Click "Email Sending" in top navigation
   - NOT "Email Testing"

3. **Add Domain:**
   - Click "Sending Domains"
   - Click "Add Domain"
   - Enter your domain: `cibn.org`

4. **Verify Domain (Add DNS Records):**
   - Mailtrap will show you DNS records to add
   - You need to add:
     - **TXT record** for verification
     - **DKIM records** for authentication
     - **SPF record** for sender verification
   
5. **Wait for verification** (can take a few minutes to 24 hours)

6. **Update `.env`:**
   ```env
   EMAILS_FROM_EMAIL=noreply@cibn.org
   ```

---

### Option 2: Use Mailtrap's Test Domain (Quick Test)

For testing purposes, Mailtrap provides a test sending domain:

1. **In Mailtrap:**
   - Go to Email Sending → Sending Domains
   - Look for "MT Verified Domain" or similar
   - This is a shared domain for testing

2. **Use this email format:**
   ```env
   EMAILS_FROM_EMAIL=hello@demomailtrap.com
   ```
   
   Or check what domain Mailtrap provides for you.

---

### Option 3: Switch to SendGrid (Easiest - No Domain Needed)

**This is what I recommend** - SendGrid doesn't require domain verification for basic use:

1. **Sign up:** https://sendgrid.com (free)

2. **Get API Key:**
   - Settings → API Keys
   - Create API Key
   - Copy it

3. **Update `.env`:**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_TLS=true
   SMTP_USER=apikey
   SMTP_PASSWORD=SG.your_sendgrid_api_key_here
   EMAILS_FROM_EMAIL=noreply@yourdomain.com
   ```

4. **Test immediately** - works without domain verification!

---

## 🎯 Quick Fix (For Immediate Testing)

If you just want to test **right now** without domain setup, use **Gmail**:

### Gmail Setup (5 minutes):

1. **Enable 2FA:**
   - Go to: https://myaccount.google.com/security
   - Turn on "2-Step Verification"

2. **Get App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer"
   - Copy the 16-character password

3. **Update `.env`:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_TLS=true
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   EMAILS_FROM_EMAIL=your-email@gmail.com
   EMAILS_FROM_NAME="CIBN Digital Library"
   ```

4. **Restart backend and test!**

**Limitation:** 
- 500 emails/day limit
- May go to spam folder
- OK for testing, not recommended for production

---

## 📊 Comparison

| Option | Setup Time | Email Limit | Domain Required | Best For |
|--------|------------|-------------|-----------------|----------|
| **Mailtrap + Domain** | 1-24 hours | 1,000/month | ✅ Yes | Your own brand |
| **SendGrid** | 5 min | 100/day | ❌ No | Production |
| **Gmail** | 3 min | 500/day | ❌ No | Quick testing |

---

## 🚀 My Recommendation: SendGrid

**Why?**
- ✅ No domain verification needed to start
- ✅ Works immediately
- ✅ Better deliverability
- ✅ 100 emails/day free
- ✅ Industry standard

**To switch to SendGrid:**

```powershell
# Just update these lines in .env:
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_TLS=true
SMTP_USER=apikey
SMTP_PASSWORD=SG.your_key_here
EMAILS_FROM_EMAIL=noreply@yourdomain.com
```

Restart backend and test - it works immediately!

---

## 🧪 Current Configuration

Your `.env` currently has:
```env
SMTP_HOST=live.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=api
SMTP_PASSWORD=bc8ddd39a168803bfd759f0870eb6bf1
EMAILS_FROM_EMAIL=smtp@mailtrap.io  ← This needs a verified domain
```

---

## ✅ Next Steps

**Choose ONE:**

### A. Continue with Mailtrap (Your domain required)
1. Add and verify your domain in Mailtrap
2. Update `EMAILS_FROM_EMAIL=noreply@yourdomain.com`
3. Wait for verification (up to 24 hours)
4. Test again

### B. Switch to SendGrid (Immediate, no domain needed)
1. Sign up: https://sendgrid.com
2. Get API key
3. Update `.env` with SendGrid settings above
4. Restart and test - works immediately!

### C. Use Gmail (Quick test only)
1. Follow Gmail setup above
2. Update `.env`
3. Restart and test
4. Switch to SendGrid/Mailtrap later for production

---

## 🎯 Fastest Solution

```powershell
# Install SendGrid in 5 minutes:
1. Go to https://sendgrid.com
2. Sign up (free)
3. Settings → API Keys → Create
4. Copy key
5. Update .env with SendGrid settings
6. Restart backend
7. Test - works immediately!
```

**Total time: 5 minutes**  
**No domain verification needed**  
**Works right away**
