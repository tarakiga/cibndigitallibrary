# Huawei Cloud Infrastructure Requirements

## Project: CIBN Digital Library

**Region:** Africa (South Africa/Johannesburg or Cairo)

---

## 1. Compute (ECS)

| Item | Specification |
|------|--------------|
| Instance Type | General Purpose (S6 series recommended) |
| vCPUs | 4 |
| RAM | 16 GB |
| OS | Ubuntu 22.04 LTS or CentOS 8 |
| System Disk | 100 GB SSD |

---

## 2. Database (RDS PostgreSQL)

| Item | Specification |
|------|--------------|
| Engine | PostgreSQL 15 |
| vCPUs | 4 |
| RAM | 8 GB |
| Storage | 100 GB SSD (expandable) |
| High Availability | Single AZ (or Multi-AZ if required) |
| Backup | Automated daily backups, 7-day retention |

---

## 3. Object Storage (OBS)

| Item | Specification |
|------|--------------|
| Storage Class | Standard |
| Capacity | 2 TB |
| Use Case | PDF documents, e-books, audio files, video files |
| Access | Private with API access |

---

## 4. Network

| Item | Specification |
|------|--------------|
| Elastic IP (EIP) | 1 static public IP |
| Bandwidth | 10 Mbps (dedicated) |
| VPC | 1 Virtual Private Cloud |
| Security Groups | Ports: 22 (SSH), 80 (HTTP), 443 (HTTPS), 5432 (PostgreSQL internal) |

---

## 5. Additional Services

| Service | Requirement |
|---------|------------|
| SSL Certificate | 1 domain certificate (free or purchased) |
| Cloud Backup & Recovery (CBR) | Daily backups for ECS and RDS |
| DNS (optional) | If domain management needed |
| CDN (optional) | For video/media delivery optimization |

---

## 6. Software Stack (for DevOps setup)

| Component | Version |
|-----------|---------|
| Docker | Latest |
| Docker Compose | Latest |
| Nginx | Alpine (reverse proxy) |
| Node.js | 18+ |
| Python | 3.11+ |

---

## 7. Deployment Architecture

```
Internet
    │
    ▼
┌─────────┐
│  Nginx  │ (Reverse Proxy + SSL)
│  :80/443│
└────┬────┘
     │
     ├──────────────────┐
     ▼                  ▼
┌─────────┐      ┌──────────┐
│Frontend │      │ Backend  │
│ :3000   │      │  :8000   │
│(Next.js)│      │(FastAPI) │
└─────────┘      └────┬─────┘
                      │
           ┌──────────┴──────────┐
           ▼                     ▼
    ┌────────────┐        ┌──────────┐
    │ PostgreSQL │        │   OBS    │
    │   (RDS)    │        │  (2TB)   │
    └────────────┘        └──────────┘
```

---

## 8. Summary Request

> **Please provide quotation for:**
> - 1x ECS instance (4 vCPU, 16GB RAM, 100GB SSD)
> - 1x RDS PostgreSQL (4 vCPU, 8GB RAM, 100GB storage)
> - 2TB OBS storage
> - 10 Mbps bandwidth with 1 EIP
> - Daily backup service (CBR)
> - SSL certificate
> - Africa region

---

*Document generated: December 2025*
*Project: CIBN Digital Library*
