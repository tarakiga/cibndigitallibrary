# Frontend-Backend Integration Testing Guide

## 🚀 Quick Start - Running Both Servers

### Step 1: Start Backend Server

Open a **new PowerShell terminal** and run:

```powershell
cd "D:\work\Tar\EMMANUEL\cibng\apps\NEWPROJECTS\LIBRARY2\backend"
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

**Backend will be available at:**
- API: `http://localhost:8000`
- Interactive Docs: `http://localhost:8000/docs`
- Alternative Docs: `http://localhost:8000/redoc`

### Step 2: Start Frontend Server

Open **another PowerShell terminal** and run:

```powershell
cd "D:\work\Tar\EMMANUEL\cibng\apps\NEWPROJECTS\LIBRARY2\frontend"
npm run dev
```

**Frontend will be available at:**
- App: `http://localhost:3007`

---

## ✅ Integration Checklist

### 1. **Test Authentication Flow**

#### A. General User Login
1. Open `http://localhost:3007`
2. Click "Sign In" button in navbar
3. Use **User** tab in login modal
4. Enter credentials:
   ```
   Email: subscriber@test.com
   Password: password123
   ```
5. Click "Sign In"
6. **Expected**: 
   - Toast notification: "Login successful!"
   - Modal closes
   - Navbar shows user avatar with initials
   - User dropdown shows email and name

#### B. CIBN Member Login
1. Click "Sign In" button
2. Switch to **CIBN Member** tab
3. Enter credentials:
   ```
   Employee ID: CIBN001
   Password: password123
   ```
4. Click "Verify & Sign In"
5. **Expected**:
   - Toast notification: "Welcome, CIBN Member!"
   - Modal closes
   - Navbar shows user info
   - User role is "cibn_member"

### 2. **Verify Auth State**

After successful login, check:

✅ **Navbar Updates**:
- User avatar appears (top right)
- Avatar shows first letter of name
- Cart icon is visible
- Sign In button is hidden

✅ **User Dropdown Menu**:
- Shows full name
- Shows email address
- "My Library" option (for non-admin users)
- "Edit Profile" option
- "Settings" option (admin only)
- "Log out" option

✅ **Console Logs** (F12 > Console):
```
Auth Token: Token exists
Login response: {user: {...}, access_token: "..."}
```

### 3. **Test Logout**

1. Click on user avatar
2. Click "Log out"
3. **Expected**:
   - Toast notification: "Logged out successfully"
   - Navbar shows "Sign In" button
   - User avatar disappears
   - Redirected to homepage

---

## 🔍 Testing API Endpoints

### Using Browser DevTools

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by "Fetch/XHR"
4. Perform actions and observe:

#### Login Request
```
POST http://localhost:8000/api/v1/auth/login
Request: {email: "...", password: "..."}
Response: {access_token: "...", token_type: "bearer", user: {...}}
```

#### Get Current User
```
GET http://localhost:8000/api/v1/auth/me
Headers: Authorization: Bearer <token>
Response: {id: 1, email: "...", full_name: "...", role: "..."}
```

### Using API Docs

Visit `http://localhost:8000/docs` to test endpoints directly:

1. **Register User**: `POST /api/v1/auth/register`
2. **Login**: `POST /api/v1/auth/login`
3. **Get User**: `GET /api/v1/auth/me`
4. **List Content**: `GET /api/v1/content`

---

## 🎯 Test Scenarios

### Scenario 1: New User Registration → Login → Browse

```powershell
# Not yet implemented in UI, but backend ready
# Will add signup modal integration next
```

### Scenario 2: Existing User Login → View Library

1. Login with: `subscriber@test.com / password123`
2. Click user avatar → "My Library"
3. Should show purchased content (if any)

### Scenario 3: CIBN Member Exclusive Access

1. Login as CIBN member: `CIBN001 / password123`
2. Browse content
3. Should see both public and exclusive content
4. Regular users only see public content

### Scenario 4: Admin Dashboard Access

1. Login as admin: `admin@test.com / admin123`
2. Click user avatar → "Settings"
3. Should access admin dashboard at `/admin/settings`

---

## 🐛 Troubleshooting

### Issue: "Network Error" or "Failed to fetch"

**Check**:
1. Backend server is running (`http://localhost:8000`)
2. Frontend server is running (`http://localhost:3007`)
3. No CORS errors in console

**Solution**:
```powershell
# Restart backend with CORS enabled (already configured)
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

### Issue: "401 Unauthorized" after login

**Check**:
1. Token is stored in localStorage
   - Open DevTools → Application → Local Storage
   - Should see `access_token` key
2. Token is being sent in requests
   - Network tab → Request Headers
   - Should have `Authorization: Bearer <token>`

**Solution**:
```javascript
// In browser console
localStorage.getItem('access_token')  // Should return token
localStorage.getItem('user')          // Should return user JSON
```

### Issue: Modal doesn't close after login

**Check Console for errors**:
- Authentication might have failed silently
- Check Network tab for API response

**Solution**:
1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Try login again

### Issue: User info doesn't show in navbar

**Check**:
1. AuthContext is properly initialized
2. User data is in state
   - React DevTools → Components → AuthProvider
   - Should show `user` state with data

**Debug in console**:
```javascript
// Check auth service
import { authService } from '@/lib/api/auth'
authService.getStoredUser()  // Should return user object
authService.isAuthenticated()  // Should return true
```

---

## 📊 Expected Behavior Summary

| Action | Expected Result | Backend Endpoint |
|--------|----------------|------------------|
| Click "Sign In" | Login modal opens | - |
| Submit login (User tab) | User logged in, token stored | `POST /auth/login` |
| Submit login (CIBN tab) | CIBN member logged in | `POST /auth/cibn-login` |
| Page refresh after login | User remains logged in | `GET /auth/me` |
| Click user avatar | Dropdown menu shows | - |
| Click "My Library" | Navigate to library page | `GET /content/purchased` |
| Click "Log out" | User logged out, token cleared | - |

---

## 🔐 Test Credentials

### Regular User (Subscriber)
```
Email: subscriber@test.com
Password: password123
Role: subscriber
```

### CIBN Member
```
Email: cibn@test.com
Password: password123
Employee ID: CIBN001
Role: cibn_member
```

### Administrator
```
Email: admin@test.com
Password: admin123
Role: admin
```

---

## ✅ Integration Status

| Feature | Status | Notes |
|---------|--------|-------|
| **AuthContext** | ✅ Complete | Provides global auth state |
| **Login Modal** | ✅ Complete | Both user and CIBN login |
| **Navbar Integration** | ✅ Complete | Shows auth state |
| **Token Management** | ✅ Complete | Stored in localStorage |
| **Auto Token Injection** | ✅ Complete | Axios interceptor adds token |
| **401 Error Handling** | ✅ Complete | Auto logout on expired token |
| **User Dropdown** | ✅ Complete | Shows user info and options |
| **Logout** | ✅ Complete | Clears token and state |

---

## 🎯 Next Steps After Testing

Once basic auth is working:

1. ✅ **Content Grid Integration** - Fetch real content from API
2. ⏳ **Signup Modal** - Connect registration flow
3. ⏳ **Content Detail Pages** - Show individual content
4. ⏳ **Payment Integration** - Add Paystack checkout
5. ⏳ **User Dashboard** - My Library page with purchases

---

## 🚨 Important Notes

1. **Backend must be running** for frontend to work
2. **Test credentials** are already seeded in database
3. **CORS is configured** for `http://localhost:3007`
4. **Tokens expire** after a set time (check backend config)
5. **Clear localStorage** if experiencing auth issues

---

**Happy Testing! 🎉**

If you encounter any issues, check the backend logs and browser console for detailed error messages.
