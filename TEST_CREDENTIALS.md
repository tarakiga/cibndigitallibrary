# 🔐 TEST USER CREDENTIALS

## Quick Reference for Testing

### 1️⃣ SUBSCRIBER (General User)
```
Email:    subscriber@test.com
Password: password123
```
**Access:** Public content only

---

### 2️⃣ CIBN MEMBER (Exclusive Access)
```
Email:       cibn@test.com
Password:    password123

OR

Employee ID: CIBN001
Password:    password123
```
**Access:** All content including exclusive CIBN materials

---

### 3️⃣ ADMIN (Full Access)
```
Email:    admin@test.com
Password: admin123
```
**Access:** Full system administration

---

### 4️⃣ ADDITIONAL TEST USERS

**CIBN Member #2:**
```
Email:       john.doe@cibn.org
Password:    cibn2024
Employee ID: CIBN002
```

**Subscriber #2:**
```
Email:    jane.smith@example.com
Password: jane2024
```

---

## 🚀 How to Create These Users

### Option 1: Via API (Easiest)

**Start backend:**
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

**Then visit:** http://localhost:8000/api/v1/docs

Use the Swagger UI to register users via `/auth/register` endpoint.

---

### Option 2: Via Seed Script

**Setup database first**, then run:
```powershell
cd backend
.\.venv\Scripts\python.exe seed_test_users.py
```

---

## 🧪 Test Login

**Backend running?** http://localhost:8000  
**Frontend running?** http://localhost:3001

Try logging in with any of the accounts above!

---

**See `DATABASE_SETUP.md` for detailed setup instructions.**
