# 🚀 CIBN Digital Library - Quick Deployment Guide

## For Deployment Team

This is a simplified guide for deploying the CIBN Digital Library using Docker on a Huawei server.

---

## ✅ Pre-Deployment Checklist

- [ ] Server has Docker and Docker Compose installed
- [ ] Git is installed on the server
- [ ] SSH access is configured
- [ ] Domain name is pointed to server (optional)
- [ ] Firewall ports 80, 443, 22 are open
- [ ] PostgreSQL port 5432 is available
- [ ] You have all environment variables ready

---

## 📦 Deployment Package Contents

This repository contains everything needed:

```
LIBRARY2/
├── backend/               # FastAPI backend
│   ├── Dockerfile        # Backend container config
│   └── app/              # Application code
├── frontend/             # Next.js frontend
│   ├── Dockerfile        # Frontend container config
│   └── src/              # Application code
├── nginx/                # Reverse proxy
│   └── nginx.conf        # Nginx configuration
├── docker-compose.prod.yml  # Production orchestration
└── .github/workflows/    # Auto-deployment config
    └── deploy.yml
```

---

## 🏃 Quick Start (5 Steps)

### Step 1: Prepare Server

```bash
# SSH into your Huawei server
ssh user@your-server-ip

# Create project directory
sudo mkdir -p /opt/cibn-library
sudo chown $USER:$USER /opt/cibn-library
cd /opt/cibn-library
```

### Step 2: Clone Repository

```bash
# Clone the project (replace with your GitHub URL)
git clone https://github.com/YOUR_ORG/cibn-library.git .
```

### Step 3: Create Environment File

```bash
# Create .env file with configuration
nano .env
```

Paste this content (replace values with actual credentials):

```env
# Database
POSTGRES_USER=cibn_user
POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD
POSTGRES_DB=cibn_library

# Security (generate with: openssl rand -hex 32)
SECRET_KEY=CHANGE_THIS_SECRET_KEY

# URLs
NEXT_PUBLIC_API_URL=http://YOUR_SERVER_IP:8000/api/v1
FRONTEND_URL=http://YOUR_SERVER_IP:3000
CORS_ORIGINS=["http://YOUR_SERVER_IP:3000"]

# Paystack
PAYSTACK_SECRET_KEY=YOUR_PAYSTACK_KEY

# CIBN External Database
CIBN_DB_SERVER=CIBN_SERVER_IP
CIBN_DB_DATABASE=cibn_members
CIBN_DB_USERNAME=CIBN_DB_USER
CIBN_DB_PASSWORD=CIBN_DB_PASSWORD
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 4: Deploy with Docker

```bash
# Build and start all services
docker compose -f docker-compose.prod.yml up -d --build

# This will:
# - Pull base Docker images
# - Build frontend and backend
# - Start PostgreSQL database
# - Start all services
# - Takes 5-10 minutes on first run
```

### Step 5: Verify Deployment

```bash
# Check all services are running
docker compose -f docker-compose.prod.yml ps

# Should see:
# - cibn_postgres_prod  (healthy)
# - cibn_backend_prod   (healthy)
# - cibn_frontend_prod  (healthy)
# - cibn_nginx_prod     (running)

# Test frontend
curl http://localhost:3000

# Test backend
curl http://localhost:8000/health
```

---

## 🌐 Access the Application

- **Frontend**: `http://YOUR_SERVER_IP`
- **Backend API**: `http://YOUR_SERVER_IP/api/v1`
- **Admin Login**: Create admin user first (see below)

---

## 👤 Create Admin User

```bash
# Enter backend container
docker compose -f docker-compose.prod.yml exec backend bash

# Create admin user
python -c "
from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()
admin = User(
    email='admin@cibn.org',
    hashed_password=get_password_hash('Admin@123'),
    full_name='Admin User',
    role='admin',
    is_active=True
)
db.add(admin)
db.commit()
print('✅ Admin user created: admin@cibn.org / Admin@123')
"

# Exit container
exit
```

**Default Admin Credentials**:
- Email: `admin@cibn.org`
- Password: `Admin@123`

⚠️ **IMPORTANT**: Change the admin password immediately after first login!

---

## 🔄 Enable Auto-Deployment from GitHub

Once manual deployment works, set up automatic deployments:

### On Server:

```bash
# Generate SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions

# Add to authorized keys
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys

# Display private key (copy this)
cat ~/.ssh/github-actions
```

### On GitHub:

1. Go to: Repository → Settings → Secrets and variables → Actions
2. Add these secrets:
   - `SERVER_HOST`: Your server IP
   - `SERVER_USER`: SSH username (e.g., `ubuntu`)
   - `SERVER_SSH_KEY`: Paste the private key from above
   - `SERVER_PORT`: SSH port (usually `22`)
   - All environment variables from `.env` file

3. Done! Now every push to `main` branch auto-deploys.

---

## 📊 Common Commands

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
```

### Restart Services

```bash
# Restart all
docker compose -f docker-compose.prod.yml restart

# Restart one service
docker compose -f docker-compose.prod.yml restart backend
```

### Stop Everything

```bash
docker compose -f docker-compose.prod.yml down
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```

### Backup Database

```bash
# Create backup
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U cibn_user cibn_library > backup.sql

# Restore backup
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U cibn_user cibn_library < backup.sql
```

---

## 📁 File Uploads Storage

**Question**: Where are uploaded files stored in production?

**Answer**: Files are stored in a Docker volume called `uploads_data`:
- Persistent across container restarts
- Located at `/app/uploads` inside the container
- Served by Nginx at `/uploads/` URL path
- To backup: 
  ```bash
  docker run --rm -v cibn-library_uploads_data:/uploads \
    -v $(pwd):/backup alpine \
    tar czf /backup/uploads-backup.tar.gz -C /uploads .
  ```

---

## 🔧 Troubleshooting

### Services not starting?

```bash
# Check what's wrong
docker compose -f docker-compose.prod.yml logs

# Check specific service
docker compose -f docker-compose.prod.yml logs backend
```

### Can't access frontend?

```bash
# Check if port is open
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check container is running
docker compose -f docker-compose.prod.yml ps frontend
```

### Database connection errors?

```bash
# Check database is running
docker compose -f docker-compose.prod.yml exec postgres pg_isready

# Check credentials in .env file
cat .env | grep POSTGRES
```

### Out of disk space?

```bash
# Check disk usage
df -h

# Clean old Docker images
docker system prune -a

# Check volume sizes
docker system df -v
```

---

## 📞 Get Help

If you encounter issues:

1. **Check logs first**: `docker compose -f docker-compose.prod.yml logs`
2. **Verify .env file**: Make sure all variables are set correctly
3. **Check firewall**: Ensure ports 80, 443, 8000, 3000 are open
4. **Contact**: 
   - Technical Lead: tech@cibn.org
   - Developer: emmanuel@cibn.org

---

## ✅ Post-Deployment Checklist

After successful deployment:

- [ ] All containers show "healthy" status
- [ ] Frontend is accessible via browser
- [ ] Backend API responds at `/api/v1/health`
- [ ] Admin user can log in
- [ ] Test file upload functionality
- [ ] Database backup scheduled
- [ ] Firewall configured properly
- [ ] SSL certificate installed (if using domain)
- [ ] GitHub auto-deployment tested
- [ ] Monitoring set up

---

## 🎉 Success!

Your CIBN Digital Library is now deployed!

**Next Steps**:
1. Change default admin password
2. Configure SSL/HTTPS
3. Set up regular backups
4. Monitor application logs
5. Test all features

---

**Deployment Time Estimate**: 15-30 minutes (first time)

**Last Updated**: October 2025
