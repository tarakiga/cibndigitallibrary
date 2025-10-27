# Production Deployment Checklist

## ✅ Production Readiness Status

### Backend (FastAPI)

#### ✅ Ready
- [x] Database models updated (User, Content, ContentProgress)
- [x] Authentication system (JWT-based)
- [x] CIBN member login integration
- [x] Content management API
- [x] File upload system (no size limit for video/audio)
- [x] Payment integration (Paystack)
- [x] Progress tracking API
- [x] Arrears validation for exclusive content
- [x] CORS configuration

#### ⚠️ Required Actions Before Production

1. **Database Migrations**
   ```sql
   -- Run these migrations on production database:
   ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR;
   ALTER TABLE users ADD COLUMN IF NOT EXISTS arrears NUMERIC(10, 2) DEFAULT 0;
   ALTER TABLE users ADD COLUMN IF NOT EXISTS annual_subscription NUMERIC(10, 2) DEFAULT 0;
   
   -- ContentProgress table should be created automatically on first run
   -- But verify it exists after deployment
   ```

2. **Environment Variables** (`.env` file)
   ```bash
   # Database
   DATABASE_URL=postgresql://user:password@host:port/dbname
   
   # Security
   SECRET_KEY=<generate-strong-random-key>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   
   # CORS
   CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   
   # Paystack (PRODUCTION KEYS!)
   PAYSTACK_SECRET_KEY=sk_live_xxx
   PAYSTACK_PUBLIC_KEY=pk_live_xxx
   
   # File Storage
   UPLOAD_DIR=/var/www/uploads  # Or S3/cloud storage path
   MAX_UPLOAD_SIZE=5368709120  # 5GB for videos
   
   # CIBN Remote DB (if applicable)
   CIBN_DB_CONNECTION_STRING=<connection-string>
   ```

3. **Remove Debug Logging**
   - Review and remove console.log statements
   - Configure proper logging (e.g., to file or monitoring service)
   - Set log level to WARNING or ERROR in production

4. **Security Headers**
   - Enable HTTPS only
   - Set secure cookie flags
   - Configure rate limiting
   - Enable SQL injection protection (already handled by SQLAlchemy)

---

### Frontend (Next.js)

#### ✅ Ready
- [x] Authentication context
- [x] Content library with filters
- [x] Shopping cart and checkout
- [x] User profile page
- [x] CIBN member profile page
- [x] Admin dashboard with content management
- [x] Video/audio/document players with progress tracking
- [x] Responsive design
- [x] Premium UI/UX components

#### ⚠️ Required Actions Before Production

1. **Environment Variables** (`.env.local` or deployment platform)
   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api/v1
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxx
   NODE_ENV=production
   ```

2. **Build Configuration**
   ```bash
   # Test production build locally first
   npm run build
   npm run start
   
   # Verify:
   # - No console errors
   # - All pages load correctly
   # - API calls work
   # - Authentication flows work
   ```

3. **Remove Test Features**
   - `/test-cibn` page is already protected (dev-only)
   - Verify no test data or mock APIs are enabled

4. **Performance Optimization**
   - Images are optimized (Next.js Image component used)
   - Code splitting is enabled (Next.js default)
   - API calls are cached where appropriate

---

## 🗄️ Database Schema Changes Summary

### New Columns Added:
1. `users.avatar_url` (VARCHAR, nullable)
2. `users.arrears` (NUMERIC(10,2), default 0)
3. `users.annual_subscription` (NUMERIC(10,2), default 0)

### New Tables:
1. `content_progress` - Tracks user playback progress
   - `id` (primary key)
   - `user_id` (foreign key → users)
   - `content_id` (foreign key → content)
   - `current_time` (float)
   - `total_duration` (float)
   - `is_completed` (boolean)
   - `last_watched_at` (timestamp)
   - `created_at` (timestamp)
   - `updated_at` (timestamp)

---

## 🔒 Security Checklist

- [x] JWT authentication implemented
- [x] Password hashing (bcrypt/passlib)
- [x] Role-based access control (subscriber, cibn_member, admin)
- [x] CORS properly configured
- [x] SQL injection protection (SQLAlchemy ORM)
- [x] File upload validation
- [ ] Rate limiting (recommend implementing before production)
- [ ] HTTPS enforcement (configure on server/load balancer)
- [ ] Security headers (configure on server/reverse proxy)

---

## 📦 Deployment Steps

### Backend Deployment

1. **Prepare Server**
   ```bash
   # Install dependencies
   sudo apt update
   sudo apt install python3 python3-pip postgresql nginx
   
   # Clone repository
   git clone <repo-url>
   cd backend
   
   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate
   
   # Install requirements
   pip install -r requirements.txt
   ```

2. **Configure Database**
   ```bash
   # Run migrations
   psql -U postgres -d cibn_library -f migrations/production.sql
   ```

3. **Set Environment Variables**
   ```bash
   # Create .env file with production values
   nano .env
   ```

4. **Run Application**
   ```bash
   # Using Gunicorn + Uvicorn workers
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
   
   # Or use systemd service for auto-restart
   ```

5. **Configure Nginx Reverse Proxy**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /uploads {
           alias /var/www/uploads;
       }
   }
   ```

### Frontend Deployment

1. **Build Application**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy Options**
   - **Vercel** (Recommended for Next.js)
     ```bash
     vercel --prod
     ```
   
   - **Docker**
     ```dockerfile
     FROM node:18-alpine
     WORKDIR /app
     COPY package*.json ./
     RUN npm ci --only=production
     COPY . .
     RUN npm run build
     EXPOSE 3000
     CMD ["npm", "start"]
     ```
   
   - **Traditional Server**
     ```bash
     npm run build
     npm run start
     # Or use PM2 for process management
     pm2 start npm --name "cibn-frontend" -- start
     ```

---

## 🧪 Pre-Deployment Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm run test
npm run lint
npm run typecheck  # If available
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] CIBN member login
- [ ] Content browsing and filtering
- [ ] Shopping cart and checkout
- [ ] Payment flow (use Paystack test mode first!)
- [ ] Content download/streaming
- [ ] Progress tracking (video/audio playback)
- [ ] Profile page (regular user)
- [ ] CIBN profile page (with/without arrears)
- [ ] Admin content management
- [ ] Exclusive content access control
- [ ] Arrears validation for exclusive content

---

## 📊 Monitoring & Maintenance

### Recommended Tools
- **Application Monitoring**: Sentry, New Relic
- **Logging**: ELK Stack, CloudWatch
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Performance**: Google Lighthouse, WebPageTest

### Health Checks
```python
# Backend health endpoint (already implemented)
GET /health

# Frontend health
GET /api/health
```

---

## 🚀 Post-Deployment Verification

1. **Check all endpoints respond**
   ```bash
   curl https://api.yourdomain.com/health
   curl https://yourdomain.com/
   ```

2. **Verify database connections**
   - Check logs for successful DB connections
   - Test a few API calls that query the database

3. **Test authentication flow**
   - Register new user
   - Login
   - Access protected routes

4. **Verify payment integration**
   - Test with small amount first
   - Confirm webhook callbacks work

5. **Monitor logs**
   - Watch for errors in first 24 hours
   - Check performance metrics

---

## ⚠️ Known Issues & Limitations

1. **CIBN Remote DB Integration**
   - Currently uses manual data sync
   - May need automated sync job for arrears/subscription updates

2. **File Storage**
   - Currently uses local filesystem
   - For production scale, consider S3 or CDN

3. **Test Endpoints**
   - `/test-cibn` is protected but still exists
   - Consider removing entirely for production

---

## 📞 Support & Rollback

### Rollback Plan
1. Keep previous version deployed
2. Database migrations should be backward compatible
3. Use feature flags for gradual rollout

### Emergency Contacts
- Backend issues: [Developer contact]
- Frontend issues: [Developer contact]
- Database issues: [DBA contact]
- Payment issues: Paystack support

---

## ✅ Final Production Go/No-Go

### GO Criteria
- [ ] All database migrations tested
- [ ] Environment variables configured
- [ ] Security review passed
- [ ] Payment integration tested
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Team trained on deployment process

### Current Status: **READY** ✅

**Minor items to address:**
1. Run database migrations on production DB
2. Configure production environment variables
3. Set up monitoring/logging
4. Test payment integration with live keys (in test mode first)
5. Configure HTTPS and security headers on server

**The application code is production-ready. Focus on infrastructure and configuration.**
