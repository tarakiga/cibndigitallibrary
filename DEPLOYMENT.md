# CIBN Digital Library - Production Deployment Guide

## 📋 Overview

This document provides comprehensive instructions for deploying the CIBN Digital Library to a Huawei server using Docker and automated CI/CD with GitHub Actions.

## 🏗️ Architecture

### Components
- **Frontend**: Next.js 14 application (Port 3000)
- **Backend**: FastAPI application (Port 8000)
- **Database**: PostgreSQL 15 (Port 5432)
- **Reverse Proxy**: Nginx (Ports 80/443)

### File Upload Storage in Production

Uploaded content (PDFs, videos, audio files, images) is stored in a **persistent Docker volume** named `uploads_data`. This ensures:
- Files persist across container restarts
- Files are accessible to both the backend API and Nginx for serving
- Easy backup and migration capabilities

**Storage Path**:
- Container: `/app/uploads`
- Nginx serves from: `/usr/share/nginx/html/uploads/`
- Volume: `uploads_data` (managed by Docker)

**File URL Pattern**: `https://your-domain.com/uploads/{filename}`

---

## 🚀 Initial Server Setup

### Prerequisites
- Huawei server with Ubuntu 20.04+ or CentOS 8+
- Docker and Docker Compose installed
- Git installed
- SSH access configured
- Domain name (optional but recommended)

### 1. Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

### 2. Create Project Directory

```bash
sudo mkdir -p /opt/cibn-library
sudo chown $USER:$USER /opt/cibn-library
cd /opt/cibn-library
```

### 3. Clone Repository

```bash
git clone https://github.com/YOUR_ORGANIZATION/cibn-library.git .
```

### 4. Create Environment File

Create `.env` file in the project root:

```bash
nano .env
```

Add the following configuration:

```env
# Database Configuration
POSTGRES_USER=cibn_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=cibn_library

# JWT Secret (generate with: openssl rand -hex 32)
SECRET_KEY=your_secret_key_here

# CORS Origins (comma-separated or JSON array)
CORS_ORIGINS=["https://your-domain.com","https://www.your-domain.com"]

# API URL
NEXT_PUBLIC_API_URL=https://your-domain.com/api/v1

# Frontend URL
FRONTEND_URL=https://your-domain.com

# Paystack Configuration
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# CIBN Member Database (External)
CIBN_DB_SERVER=your_cibn_db_server
CIBN_DB_DATABASE=cibn_members
CIBN_DB_USERNAME=cibn_db_user
CIBN_DB_PASSWORD=cibn_db_password
```

---

## 🤖 GitHub Actions CI/CD Setup

### 1. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `SERVER_HOST` | Server IP address | `123.45.67.89` |
| `SERVER_USER` | SSH username | `ubuntu` |
| `SERVER_SSH_KEY` | Private SSH key | (paste your private key) |
| `SERVER_PORT` | SSH port (default 22) | `22` |
| `POSTGRES_USER` | Database user | `cibn_user` |
| `POSTGRES_PASSWORD` | Database password | (secure password) |
| `POSTGRES_DB` | Database name | `cibn_library` |
| `SECRET_KEY` | JWT secret key | (generate with openssl) |
| `CORS_ORIGINS` | Allowed origins | `["https://domain.com"]` |
| `NEXT_PUBLIC_API_URL` | Public API URL | `https://domain.com/api/v1` |
| `FRONTEND_URL` | Frontend URL | `https://domain.com` |
| `PAYSTACK_SECRET_KEY` | Paystack secret | (from Paystack) |
| `CIBN_DB_SERVER` | CIBN DB server | (external server) |
| `CIBN_DB_DATABASE` | CIBN DB name | `cibn_members` |
| `CIBN_DB_USERNAME` | CIBN DB user | (username) |
| `CIBN_DB_PASSWORD` | CIBN DB password | (password) |

### 2. Generate SSH Key for GitHub Actions

On your server:

```bash
# Generate new SSH key
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions

# Add public key to authorized_keys
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys

# Copy private key to clipboard
cat ~/.ssh/github-actions
```

Paste the private key into `SERVER_SSH_KEY` secret in GitHub.

---

## 🐳 Manual Deployment (First Time)

### 1. Build and Start Services

```bash
cd /opt/cibn-library

# Build and start all services
docker compose -f docker-compose.prod.yml up -d --build

# Check status
docker compose -f docker-compose.prod.yml ps
```

### 2. Run Database Migrations

```bash
# Run migrations (if using Alembic)
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

### 3. Create Admin User

```bash
# Access backend container
docker compose -f docker-compose.prod.yml exec backend bash

# Create admin user (run Python script)
python -c "from app.db.session import SessionLocal; from app.models.user import User; from app.core.security import get_password_hash; db = SessionLocal(); admin = User(email='admin@cibn.org', hashed_password=get_password_hash('Admin@123'), full_name='Admin User', role='admin', is_active=True); db.add(admin); db.commit(); print('Admin user created')"
```

### 4. Verify Deployment

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Check frontend
curl http://localhost:3000

# Check backend health
curl http://localhost:8000/health

# Check database
docker compose -f docker-compose.prod.yml exec postgres psql -U cibn_user -d cibn_library -c "\dt"
```

---

## 🔄 Automatic Deployment Workflow

Once GitHub Actions is configured, deployments happen automatically:

1. **Push to main branch**:
   ```bash
   git add .
   git commit -m "feat: new feature"
   git push origin main
   ```

2. **GitHub Actions triggers**:
   - Connects to server via SSH
   - Pulls latest code
   - Rebuilds Docker images
   - Restarts containers
   - Runs migrations
   - Performs health checks

3. **Monitor deployment**:
   - Go to GitHub → Actions tab
   - View workflow progress in real-time

---

## 📦 File Upload Management

### Backup Uploaded Files

```bash
# Create backup
docker run --rm -v cibn-library_uploads_data:/uploads -v $(pwd):/backup alpine tar czf /backup/uploads-backup-$(date +%Y%m%d).tar.gz -C /uploads .

# Restore from backup
docker run --rm -v cibn-library_uploads_data:/uploads -v $(pwd):/backup alpine sh -c "cd /uploads && tar xzf /backup/uploads-backup-YYYYMMDD.tar.gz"
```

### Monitor Storage Usage

```bash
# Check volume size
docker system df -v

# Check uploads directory size
docker compose -f docker-compose.prod.yml exec backend du -sh /app/uploads
```

### Clean Old Files (Optional)

```bash
# Remove files older than 30 days (adjust as needed)
docker compose -f docker-compose.prod.yml exec backend find /app/uploads -type f -mtime +30 -delete
```

---

## 🔧 Maintenance Commands

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f nginx
```

### Restart Services

```bash
# Restart all
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart backend
```

### Update Application

```bash
# Pull latest changes
cd /opt/cibn-library
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```

### Database Backup

```bash
# Backup database
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U cibn_user cibn_library > backup-$(date +%Y%m%d).sql

# Restore database
docker compose -f docker-compose.prod.yml exec -T postgres psql -U cibn_user cibn_library < backup-YYYYMMDD.sql
```

### Clean Docker Resources

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes (CAREFUL!)
docker volume prune

# Full cleanup
docker system prune -a --volumes
```

---

## 🛡️ Security Considerations

1. **SSL/TLS Configuration**: 
   - Use Let's Encrypt for free SSL certificates
   - Uncomment SSL section in `nginx/nginx.conf`
   - Run: `certbot --nginx -d your-domain.com`

2. **Firewall Setup**:
   ```bash
   sudo ufw allow 22/tcp   # SSH
   sudo ufw allow 80/tcp   # HTTP
   sudo ufw allow 443/tcp  # HTTPS
   sudo ufw enable
   ```

3. **Environment Variables**:
   - Never commit `.env` file
   - Use strong passwords
   - Rotate secrets regularly

4. **Database Security**:
   - Use strong PostgreSQL password
   - Restrict database access to Docker network
   - Regular backups

---

## 📊 Monitoring & Logging

### Health Checks

```bash
# Check all services
curl http://your-domain.com/health
curl http://your-domain.com/api/v1/health

# Check Docker health status
docker compose -f docker-compose.prod.yml ps
```

### Log Aggregation

Logs are stored in:
- Nginx: Container logs
- Backend: `/app/logs` (mounted)
- Frontend: Container logs
- PostgreSQL: Container logs

---

## 🆘 Troubleshooting

### Services Not Starting

```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# View detailed logs
docker compose -f docker-compose.prod.yml logs

# Restart problematic service
docker compose -f docker-compose.prod.yml restart SERVICE_NAME
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker compose -f docker-compose.prod.yml exec postgres pg_isready

# Test connection from backend
docker compose -f docker-compose.prod.yml exec backend python -c "from app.db.session import SessionLocal; db = SessionLocal(); print('Connected')"
```

### Upload Issues

```bash
# Check uploads directory permissions
docker compose -f docker-compose.prod.yml exec backend ls -la /app/uploads

# Check volume mount
docker volume inspect cibn-library_uploads_data
```

---

## 📞 Support

For deployment issues, contact:
- DevOps Team: devops@cibn.org
- Technical Lead: tech@cibn.org

---

**Last Updated**: October 2025
