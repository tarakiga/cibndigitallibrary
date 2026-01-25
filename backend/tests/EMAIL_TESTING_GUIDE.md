# Email Testing Guide - CIBN Digital Library

This guide explains how to configure and test email functionality for signup and password reset flows.

## 📋 Overview

The application now includes:
- ✅ Welcome emails on user registration
- ✅ Password reset emails with secure tokens
- ✅ Forgot password flow
- ✅ Reset password functionality

## 🔧 Configuration

### 1. Update SMTP Credentials in `.env`

Edit `backend/.env` and update these values with your real SMTP credentials:

```env
# Email Configuration
SMTP_TLS=true
SMTP_PORT=587
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-actual-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
EMAILS_FROM_EMAIL=noreply@cibn.org
EMAILS_FROM_NAME="CIBN Digital Library"
```

### 2. For Gmail Users

If using Gmail, you need to:

1. **Enable 2-Factor Authentication**
   - Go to Google Account Settings
   - Security → 2-Step Verification
   - Enable it

2. **Generate App-Specific Password**
   - Go to Security → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_PASSWORD`

### 3. For Other Email Providers

Update the SMTP settings according to your provider:

| Provider | SMTP Host | Port | TLS |
|----------|-----------|------|-----|
| Gmail | smtp.gmail.com | 587 | true |
| Outlook | smtp.office365.com | 587 | true |
| Yahoo | smtp.mail.yahoo.com | 587 | true |
| SendGrid | smtp.sendgrid.net | 587 | true |

## 🧪 Testing

### Automated Tests (with Mock)

Run the comprehensive test suite:

```bash
cd backend
pytest tests/test_password_reset.py -v
```

This tests:
- ✅ Forgot password endpoint
- ✅ Reset password endpoint
- ✅ Welcome email on registration
- ✅ Email service functionality
- ✅ Token expiration
- ✅ Error handling

### Manual Testing (with Real SMTP)

Run the interactive email test script:

```bash
cd backend
python tests/manual_email_test.py
```

This will:
1. Check your SMTP configuration
2. Let you choose which email to test
3. Send real emails to verify delivery

## 📝 API Endpoints

### 1. Register (with Welcome Email)

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "role": "subscriber"
}
```

Response: `201 Created`
- User is created
- Welcome email is sent (non-blocking)

### 2. Forgot Password

```http
POST /api/v1/auth/forgot-password?email=user@example.com
```

Response: `200 OK`
```json
{
  "message": "If your email exists in our system, you will receive password reset instructions."
}
```

- Generates secure reset token
- Sends password reset email with link
- Token expires in 24 hours
- Always returns success (prevents email enumeration)

### 3. Reset Password

```http
POST /api/v1/auth/reset-password?token=abc123&new_password=NewPass123!
```

Response: `200 OK`
```json
{
  "message": "Password reset successfully"
}
```

Validates:
- ✅ Token exists
- ✅ Token not expired
- ✅ Password strength (min 8 characters)

## 🔐 Security Features

1. **Token Security**
   - Uses `secrets.token_urlsafe(32)` for cryptographically secure tokens
   - Tokens stored hashed in database
   - Indexed for fast lookup

2. **Token Expiration**
   - Tokens expire after 24 hours
   - Expired tokens are rejected
   - Token cleared after successful reset

3. **Email Enumeration Prevention**
   - Forgot password always returns success
   - Doesn't reveal if email exists

4. **Non-Blocking Email**
   - Registration doesn't fail if email fails
   - Password reset doesn't fail if email fails
   - Errors logged for debugging

## 🎨 Email Templates

Both emails use professional HTML templates with:
- Responsive design
- CIBN branding (blue and green gradient)
- Clear call-to-action buttons
- Plain text fallback
- Mobile-friendly layout

### Welcome Email Features
- Personalized greeting
- Overview of platform features
- Link to start exploring
- Professional footer

### Password Reset Email Features
- Secure reset button
- Plain text link as backup
- 24-hour expiration warning
- Security notice

## 🐛 Troubleshooting

### SMTP Authentication Failed

**Error**: `SMTPAuthenticationError: (535, b'5.7.8 Username and Password not accepted')`

**Solution**:
- Verify credentials are correct
- For Gmail, use app-specific password (not your regular password)
- Check 2FA is enabled

### Connection Refused

**Error**: `ConnectionRefusedError: [Errno 111] Connection refused`

**Solution**:
- Check SMTP host and port are correct
- Verify firewall allows outbound connections
- Test with `telnet smtp.gmail.com 587`

### Emails in Spam

**Solution**:
- Use a professional "from" email address
- Consider using SPF/DKIM records
- Use a dedicated email service (SendGrid, Mailgun)

### Email Not Received

**Solution**:
- Check spam folder
- Verify email address is correct
- Check application logs for errors
- Run manual test script to verify SMTP works

## 📊 Database Changes

New fields added to `users` table:

```sql
ALTER TABLE users ADD COLUMN reset_token VARCHAR;
ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP WITH TIME ZONE;
CREATE INDEX ix_users_reset_token ON users (reset_token);
```

Migration file: `migrations/versions/58a8fe653148_add_password_reset_fields.py`

To apply migration:
```bash
cd backend
python -m alembic upgrade head
```

## ✅ Verification Checklist

Before deploying to production:

- [ ] SMTP credentials configured in `.env`
- [ ] Database migration applied
- [ ] Automated tests passing
- [ ] Manual email test successful
- [ ] Frontend reset password page working
- [ ] Welcome email received on signup
- [ ] Password reset email received
- [ ] Reset link works correctly
- [ ] Expired tokens rejected
- [ ] Invalid tokens rejected

## 🚀 Frontend Integration

The frontend already has the UI:
- `frontend/src/components/auth/forgot-password-modal.tsx` - Forgot password modal
- `frontend/src/lib/api/auth.ts` - API calls for forgot/reset password

Just update `FRONTEND_URL` in `.env` to match your frontend URL:
```env
FRONTEND_URL=http://localhost:3007
```

## 📞 Support

If you encounter issues:
1. Check application logs
2. Run manual email test script
3. Verify SMTP credentials
4. Check firewall settings
5. Test with a different email provider

## 🎯 Production Recommendations

For production, consider:
1. **Use a dedicated email service** (SendGrid, Mailgun, AWS SES)
2. **Set up SPF/DKIM records** to avoid spam
3. **Monitor email delivery rates**
4. **Implement email queue** for reliability
5. **Add rate limiting** to prevent abuse
6. **Log email events** for debugging
