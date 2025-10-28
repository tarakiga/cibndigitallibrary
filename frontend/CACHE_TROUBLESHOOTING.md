# 🔧 Login Modal Cache Troubleshooting Guide

## Problem
The console shows old "Login attempt: Object {...}" messages instead of our new AuthContext integration, indicating cached files are still running.

## Root Cause
- Next.js build cache (.next folder) contains old compiled files
- Browser cache has old JavaScript files
- Node.js module cache has stale files
- Development server hasn't picked up file changes

## Solution Steps

### 1. Stop All Node Processes ⚠️
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*npm*"} | Stop-Process -Force
```

### 2. Clear Next.js Build Cache 🗑️
```powershell
# Navigate to frontend directory
cd D:\work\Tar\EMMANUEL\cibng\apps\NEWPROJECTS\LIBRARY2\frontend

# Remove Next.js cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
```

### 3. Clear Browser Cache 🌐
**Option A: Hard Refresh**
- Press `Ctrl + Shift + R` (Windows)
- Or `Cmd + Shift + R` (Mac)

**Option B: Developer Tools**
1. Press `F12` to open DevTools
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Option C: Clear All Site Data**
1. Press `F12` → Go to `Application` tab
2. In sidebar: `Storage` → `Clear site data`
3. Click "Clear site data" button

### 4. Restart Development Server 🚀
```powershell
npm run dev
```

### 5. Verify New Code is Running ✅

**Look for this console message:**
```
NEW handleSubmit called with AuthContext integration
```

**NOT this old message:**
```
Login attempt: Object { userType: "general", email: "...", password: "..." }
```

## Expected Behavior After Fix

### ✅ **Login Modal Features:**
- Modal opens when clicking "Sign In" button
- Close button (X) in top-right corner works
- Form validation prevents empty submissions
- Loading states show during authentication
- Toast notifications for success/error messages

### ✅ **API Integration:**
- Calls `POST /api/v1/auth/login` for general users
- Calls `POST /api/v1/auth/cibn-login` for CIBN members
- JWT tokens stored automatically
- Global authentication state updated

### ✅ **Error Handling:**
- Network errors show helpful messages
- Invalid credentials show appropriate errors
- Form validation errors display inline

## Alternative Solutions

### If Cache Clearing Doesn't Work:

1. **Try Different Browser**
   - Use Chrome incognito mode
   - Use Firefox private window
   - Use Edge private window

2. **Try Different Port**
   ```powershell
   # Kill process on port 3001
   netstat -ano | findstr :3001
   taskkill /PID <PID_NUMBER> /F
   
   # Start on port 3000
   npx next dev -p 3000
   ```

3. **Check for Duplicate Files**
   ```powershell
   # Search for multiple login modal files
   Get-ChildItem -Path "src" -Recurse -Name "*login*modal*"
   ```

4. **Reinstall Dependencies**
   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

## Debug Commands

### Check Running Processes:
```powershell
Get-Process | Where-Object {$_.ProcessName -like "*node*"}
```

### Check Port Usage:
```powershell
netstat -ano | findstr :3001
```

### Test Backend Connection:
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"test@test.com","password":"test123"}'
```

## Success Indicators

### ✅ **New Code is Running When You See:**
- Console: "NEW handleSubmit called with AuthContext integration"
- Toast notifications appear on login attempts
- Proper error messages in modal
- AuthContext methods being called
- JWT tokens in browser localStorage

### ❌ **Old Code Still Running When You See:**
- Console: "Login attempt: Object {...}"
- No toast notifications
- No proper error handling
- Modal doesn't close properly
- No API calls to backend

## Contact
If issues persist after following this guide, the problem may be more complex and require debugging the specific development environment setup.

**Last Updated**: December 2024
**Version**: 1.0