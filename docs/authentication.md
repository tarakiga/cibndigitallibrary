---
title: Authentication System
description: Complete guide to the CIBN Digital Library authentication system, login process, and user management
---

# Authentication System

The CIBN Digital Library features a comprehensive authentication system that supports both general users and CIBN members with secure JWT token-based authentication.

## Overview

Our authentication system provides:

- 🔐 **Dual Login Types**: Support for general users and CIBN members
- 🛡️ **JWT Token Security**: Secure token-based authentication
- 🎨 **Seamless Experience**: Modern login modal with form validation
- 🔄 **Global State Management**: React Context for authentication state
- 📱 **Error Handling**: Comprehensive error messages and user feedback
- 🎉 **Success Notifications**: Toast notifications for login/logout actions

---

## User Types

### General Users
General users can access public content and purchase premium resources.

**Login Requirements:**
- Email address
- Password

**Access Level:**
- Public content (free)
- Premium content (purchase required)
- Personal library and order history

### CIBN Members
CIBN members have privileged access to exclusive content and resources.

**Login Requirements:**
- CIBN Employee ID
- Department selection
- Password

**Access Level:**
- All general user content
- Exclusive CIBN member content
- Enhanced library features
- Priority customer support

---

## Login Process

### Step 1: Access Login Modal
Click the **"Sign In"** button in the top navigation bar to open the login modal.

### Step 2: Choose User Type
Select your account type:
- **General User** - For public users
- **CIBN Member** - For CIBN employees

### Step 3: Enter Credentials

#### For General Users:
1. Enter your **email address**
2. Enter your **password**
3. Optionally check **"Remember me"**
4. Click **"Sign In"**

#### For CIBN Members:
1. Enter your **CIBN Employee ID**
2. Select your **department** from the dropdown
3. Enter your **password**
4. Click **"Verify & Sign In"**

### Step 4: Authentication
The system will:
- Validate your credentials
- Generate a secure JWT token
- Update your authentication status
- Close the modal and show success notification

---

## Features

### Form Validation
- **Real-time Validation**: Forms validate input as you type
- **Required Field Indicators**: Clear visual indicators for required fields
- **Error Messages**: Helpful error messages for invalid input
- **Submit Prevention**: Cannot submit incomplete forms

### Security Features
- **Password Visibility Toggle**: Eye icon to show/hide password
- **Secure Token Storage**: JWT tokens stored securely in browser
- **Automatic Logout**: Invalid tokens trigger automatic logout
- **Session Management**: Tokens automatically included in API requests

### User Experience
- **Loading States**: Visual feedback during authentication
- **Success Notifications**: Toast messages confirm successful login
- **Error Handling**: Clear error messages for failed attempts
- **Remember Me**: Option to stay logged in longer
- **Easy Modal Close**: Click X button or outside modal to close

### Social Login (Coming Soon)
- **Continue with Google**: Quick Google account login
- **Continue with Facebook**: Quick Facebook account login

---

## Department Options (CIBN Members)

CIBN members can select from the following departments:

- **Banking Operations**
- **Research & Development**
- **Training & Education**
- **Compliance**
- **Administration**
- **Information Technology**
- **Finance**
- **Human Resources**

---

## Error Handling

### Common Login Errors

#### "Please fill in all required fields"
- **Cause**: Missing required form fields
- **Solution**: Complete all required fields before submitting

#### "Incorrect email or password"
- **Cause**: Invalid credentials for general users
- **Solution**: Check your email and password, or use "Forgot password?" link

#### "Invalid employee ID or password"
- **Cause**: Invalid credentials for CIBN members
- **Solution**: Verify your employee ID and password with HR department

#### "Network error. Please check if the backend server is running."
- **Cause**: Connection issue with authentication server
- **Solution**: Check internet connection or try again later

### Getting Help
- **Forgot Password**: Click the "Forgot password?" link in the login modal
- **CIBN Credentials**: Click "Need help with your CIBN credentials?" for support
- **Technical Support**: Contact support team for persistent issues

---

## Account Creation

### New General Users
Don't have an account? Click **"Sign up for free"** at the bottom of the login modal to create a new account.

**Registration Requirements:**
- Valid email address
- Secure password
- Full name
- Phone number (optional)

### CIBN Member Accounts
CIBN member accounts are created by the CIBN IT department. Contact your HR department if you need:
- New CIBN member account
- Employee ID verification
- Department assignment
- Password reset

---

## Authentication Status

### Logged In State
When successfully authenticated, you'll see:
- Your name/profile in the navigation bar
- Access to protected content
- Personal library and order history
- Account management options

### Logged Out State
When not authenticated, you'll see:
- "Sign In" button in navigation
- Limited access to free content only
- Prompts to sign in for premium content

---

## Security Best Practices

### For Users
- **Strong Passwords**: Use unique, strong passwords
- **Secure Logout**: Always log out on shared devices
- **Account Monitoring**: Report suspicious account activity
- **Browser Security**: Keep your browser updated

### System Security
- **JWT Tokens**: Secure, time-limited authentication tokens
- **HTTPS Encryption**: All authentication data encrypted in transit
- **Input Validation**: All form inputs validated on client and server
- **Rate Limiting**: Protection against brute force attacks

---

## Troubleshooting

### Login Issues

**Problem**: Login modal doesn't open
- **Solution**: Refresh the page and try again

**Problem**: Form doesn't submit
- **Solution**: Check for validation errors and complete all required fields

**Problem**: "Session expired" message
- **Solution**: Your login session has expired, please log in again

### Account Issues

**Problem**: Forgot email address
- **Solution**: Contact customer support with your phone number or employee ID

**Problem**: Account locked
- **Solution**: Contact support to unlock your account

**Problem**: Department not listed (CIBN members)
- **Solution**: Contact HR department to update your department information

---

## API Integration

The authentication system integrates with the following backend endpoints:

- **POST** `/api/v1/auth/login` - General user authentication
- **POST** `/api/v1/auth/cibn-login` - CIBN member authentication
- **GET** `/api/v1/auth/me` - Get current user information
- **POST** `/api/v1/auth/logout` - User logout

### Authentication Flow
1. User submits login form
2. Frontend validates input
3. API call to authentication endpoint
4. Backend validates credentials
5. JWT token returned on success
6. Token stored and used for subsequent requests
7. User state updated throughout application

---

## Support

### Contact Information
- **Email**: support@cibng.org
- **Phone**: +234 (0) 1 461 1843
- **Hours**: Monday - Friday, 9:00 AM - 5:00 PM (WAT)

### CIBN Members
For CIBN-specific account issues:
- **HR Department**: hr@cibng.org
- **IT Support**: it@cibng.org
- **Main Office**: Adeola Hopewell Street, Victoria Island, Lagos

---

*Last updated: December 2024*