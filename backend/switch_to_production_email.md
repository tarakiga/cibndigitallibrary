# Switch from Mailtrap Sandbox to Real Email Sending

## Current Setup
You're currently using Mailtrap **Sandbox** (test emails only).

```env
SMTP_HOST=sandbox.smtp.mailtrap.io  ← Sandbox (test only)
SMTP_PORT=2525
```

---

## Option 1: Stay with Mailtrap (Production Sending)

**Free Tier:** 1,000 emails/month

### Steps:

1. **Login to Mailtrap:** https://mailtrap.io/signin

2. **Switch to "Email Sending"** (top navigation)

3. **Add Domain:**
   - Go to "Domains" tab
   - Click "Add Domain"
   - Follow verification steps (add DNS records)
   - OR use Mailtrap's shared domain

4. **Get SMTP Credentials:**
   - Click on your domain
   - Go to "SMTP Settings"
   - Copy credentials

5. **Update `.env`:**

```env
# Change these lines in backend/.env
SMTP_HOST=live.smtp.mailtrap.io
SMTP_PORT=587
SMTP_TLS=true
SMTP_USER=your_mailtrap_production_user
SMTP_PASSWORD=your_mailtrap_production_password
EMAILS_FROM_EMAIL=noreply@yourdomain.com
EMAILS_FROM_NAME="CIBN Digital Library"
```

6. **Restart backend**

---

## Option 2: Switch to SendGrid (Recommended)

**Free Tier:** 100 emails/day forever

### Why SendGrid?
- ✅ Better deliverability
- ✅ More features
- ✅ Industry standard
- ✅ Easy setup

### Steps:

1. **Sign up:** https://sendgrid.com

2. **Verify your email**

3. **Create API Key:**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name it "CIBN Digital Library"
   - Choose "Full Access"
   - Copy the key (you won't see it again!)

4. **Update `.env`:**

```env
# Change these lines in backend/.env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_TLS=true
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxx
EMAILS_FROM_EMAIL=noreply@yourdomain.com
EMAILS_FROM_NAME="CIBN Digital Library"
```

5. **Restart backend**

---

## Option 3: Gmail (Quick Test - Not Recommended for Production)

**Limit:** 500 emails/day, may go to spam

### Steps:

1. **Enable 2FA on Gmail:**
   - https://myaccount.google.com/security
   - Turn on "2-Step Verification"

2. **Create App Password:**
   - https://myaccount.google.com/apppasswords
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

---

## Quick Comparison

| Service | Free Tier | Setup Time | Deliverability | Best For |
|---------|-----------|------------|----------------|----------|
| **Mailtrap** | 1,000/month | 10 min | Good | Staying with current |
| **SendGrid** | 100/day | 5 min | Excellent | Production |
| **Gmail** | 500/day | 3 min | Poor | Quick testing |

---

## My Recommendation: SendGrid

**Why?**
1. ✅ Most reliable
2. ✅ Best deliverability
3. ✅ Easiest setup
4. ✅ Industry standard
5. ✅ 100 emails/day free forever

---

## After Updating `.env`

### 1. Restart Backend

```powershell
# Stop current backend (Ctrl+C)
# Then restart
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Test Email Sending

```powershell
python tests/manual_email_test.py
```

### 3. Test Registration

1. Register a new user in your app
2. Check your **actual email inbox** (not Mailtrap)
3. You should receive the welcome email!

### 4. Test Forgot Password

1. Click "Forgot Password"
2. Enter your email
3. Check your **actual email inbox**
4. You should receive the reset email!

---

## Troubleshooting

### Emails going to spam?

**SendGrid/Mailtrap:**
- Verify your domain (add SPF/DKIM records)
- Use a professional "from" address

**Gmail:**
- Will likely go to spam
- Not recommended for production

### Authentication failed?

**SendGrid:**
- Make sure `SMTP_USER=apikey` (literally the word "apikey")
- Check API key is correct

**Gmail:**
- Use app-specific password, not regular password
- Make sure 2FA is enabled first

**Mailtrap:**
- Make sure you're using **production** credentials, not sandbox
- Check you're on `live.smtp.mailtrap.io`, not `sandbox.smtp.mailtrap.io`

### Connection refused?

- Check SMTP host is correct
- Verify port is 587
- Ensure SMTP_TLS=true

---

## Need Help?

Run the test script to check configuration:

```powershell
cd backend
python tests/manual_email_test.py
```

This will tell you if your SMTP is configured correctly.

---

## 🎯 Quick Start (Recommended)

**For fastest setup with real emails:**

1. Go to https://sendgrid.com
2. Sign up (free)
3. Create API Key
4. Update `.env` with SendGrid settings above
5. Restart backend
6. Test with `python tests/manual_email_test.py`
7. Enter your real email address
8. Check your inbox!

**Total time: 5 minutes** ⏱️
