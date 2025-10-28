# Database Setup & Test Users Guide

## 🗄️ PostgreSQL Database Setup

### Step 1: Create Database and User

Open PostgreSQL command line or pgAdmin and run:

```sql
-- Create database
CREATE DATABASE cibn_library;

-- Create user
CREATE USER cibn_user WITH PASSWORD 'cibn_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cibn_library TO cibn_user;

-- Connect to the database
\c cibn_library

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO cibn_user;
```

### Step 2: Run Database Migrations

```powershell
cd backend
.\.venv\Scripts\Activate.ps1

# Run migrations to create tables
alembic upgrade head

# OR if alembic not set up, tables will be created automatically when you start the server
uvicorn app.main:app --reload
```

### Step 3: Create Test Users

Run the seed script:

```powershell
cd backend
.\.venv\Scripts\python.exe seed_test_users.py
```

---

## 🔐 TEST USER CREDENTIALS

### 1️⃣  **SUBSCRIBER ACCOUNT** (General User)
```
Email:    subscriber@test.com
Password: password123
Role:     Subscriber
Access:   Public content only
```

**Use this account to:**
- Browse public content
- Purchase items
- Test subscriber features

---

### 2️⃣  **CIBN MEMBER ACCOUNT** (Exclusive Access)

**Option A: Email Login**
```
Email:    cibn@test.com
Password: password123
```

**Option B: Employee ID Login**
```
Employee ID: CIBN001
Password:    password123
```

**Role:**     CIBN Member  
**Access:**   All content including exclusive CIBN materials

**Use this account to:**
- Access exclusive CIBN content
- Test member-only features
- Verify employee ID login

---

### 3️⃣  **ADMIN ACCOUNT** (Full Access)
```
Email:    admin@test.com
Password: admin123
Role:     Administrator
Access:   Full system access
```

**Use this account to:**
- Manage content (create, update, delete)
- View all users
- Access admin dashboard
- Test admin-only features

---

### 4️⃣  **ADDITIONAL TEST USERS**

**CIBN Member #2:**
```
Email:       john.doe@cibn.org
Password:    cibn2024
Employee ID: CIBN002
Role:        CIBN Member
```

**Subscriber #2:**
```
Email:    jane.smith@example.com
Password: jane2024
Role:     Subscriber
```

---

## 🧪 Alternative: Use Backend API Directly

If database setup is complex, you can register users via the API:

### Start the Backend
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

### Register via API
```bash
# Register Subscriber
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "phone": "+2348012345678",
    "role": "subscriber"
  }'

# Register CIBN Member
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cibn@example.com",
    "password": "password123",
    "full_name": "CIBN Member",
    "phone": "+2348012345678",
    "role": "cibn_member",
    "cibn_employee_id": "CIBN123"
  }'
```

### Or use PowerShell:
```powershell
# Register Subscriber
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"password123","full_name":"Test User","phone":"+2348012345678","role":"subscriber"}'
```

---

## 🔍 Verify Test Users

### Check via API

**List Users (requires database access):**
```powershell
python seed_test_users.py --list
```

**Test Login:**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"subscriber@test.com","password":"password123"}'
```

### Expected Response:
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "subscriber@test.com",
    "full_name": "Test Subscriber",
    "role": "subscriber",
    "is_active": true
  }
}
```

---

## 🎯 Testing Login on Frontend

### Start Both Servers

**Backend:**
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```
Runs on: http://localhost:8000

**Frontend:**
```powershell
cd frontend
npm run dev
```
Runs on: http://localhost:3001

### Test Login Flow

1. Open browser to http://localhost:3001
2. Click "Sign In" button
3. Try each test account:
   - **Subscriber:** subscriber@test.com / password123
   - **CIBN Member:** cibn@test.com / password123
   - **Admin:** admin@test.com / admin123

4. Check browser console for:
   - API requests to `/api/v1/auth/login`
   - localStorage for `access_token` and `user`

5. Verify different access levels:
   - Subscriber sees only public content
   - CIBN Member sees exclusive content
   - Admin can manage content

---

## 🐛 Troubleshooting

### Issue: Database Connection Failed
**Error:** `password authentication failed for user "cibn_user"`

**Solution:**
1. Check PostgreSQL is running: `Get-Service postgresql*`
2. Verify database exists: `psql -U postgres -c "\l"`
3. Create database and user (see Step 1 above)
4. Update password in `backend/app/core/config.py` if needed

### Issue: Tables Don't Exist
**Error:** `relation "users" does not exist`

**Solution:**
```powershell
cd backend
alembic upgrade head
```

Or start the server - tables will be created automatically

### Issue: Can't Create Admin User
**Solution:** Admin users can only be created via database or seed script, not via registration API

---

## 📝 Quick Reference

| Account Type | Email | Password | Employee ID | Access Level |
|-------------|-------|----------|-------------|--------------|
| Subscriber | subscriber@test.com | password123 | - | Public only |
| CIBN Member | cibn@test.com | password123 | CIBN001 | All content |
| Admin | admin@test.com | admin123 | - | Full access |
| CIBN Member 2 | john.doe@cibn.org | cibn2024 | CIBN002 | All content |
| Subscriber 2 | jane.smith@example.com | jane2024 | - | Public only |

---

## 🔄 Reset Database

If you need to start fresh:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Drop and recreate database
DROP DATABASE cibn_library;
CREATE DATABASE cibn_library;
GRANT ALL PRIVILEGES ON DATABASE cibn_library TO cibn_user;

-- Reconnect and grant schema privileges
\c cibn_library
GRANT ALL ON SCHEMA public TO cibn_user;
```

Then run migrations and seed script again.

---

## 📊 Summary

**Test accounts are ready to use for:**
- ✅ Login/authentication testing
- ✅ Role-based access control testing
- ✅ CIBN member exclusive content testing
- ✅ Admin functionality testing
- ✅ Frontend integration testing

**Credentials saved in this document for reference!**
