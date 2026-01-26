# Huawei Cloud Deployment Guide

This guide details the steps to deploy the CIBN Digital Library on Huawei Cloud Elastic Cloud Server (ECS).

## Prerequisites
-   **Huawei Cloud Account** with active billing.
-   **SSH Key Pair** created in Huawei Console.
-   **Elastic IP (EIP)** purchased and ready to bind.

## 1. Provision ECS Instance
Follow the specifications in `nginx/HUAWEI_CLOUD_REQUIREMENTS.md`:
1.  **Region**: Africa (Joburg/Cairo).
2.  **Image**: Ubuntu 22.04 LTS (Recommended).
3.  **Instance Type**: General Purpose (e.g., S6.large.4 - 4vCPU, 16GB RAM).
4.  **Security Group**: Create a new rule allowing Inbound traffic on:
    -   TCP 22 (SSH)
    -   TCP 80 (HTTP)
    -   TCP 443 (HTTPS)
5.  **EIP**: Bind your Elastic IP (`83.101.48.103`) to this instance.

## 2. Server Setup (SSH)
Connect to your instance:
```bash
ssh -i /path/to/your-key.pem root@83.101.48.103
```

### Install Docker Engine & Compose
```bash
# Update packages
apt-get update && apt-get upgrade -y

# Install Docker dependencies
apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
docker compose version

### Troubleshooting Docker
If you see "Cannot connect to the Docker daemon", it means Docker is not running. Start it:
```bash
systemctl start docker
systemctl enable docker
```
```

## 3. Application Deployment

### Clone Repository
```bash
git clone https://github.com/tarakiga/cibndigitallibrary.git
cd cibndigitallibrary
```

### Configure Environment
Copy the production template:
```bash
cp .env.production.example .env
```
**Edit `.env`** (`nano .env`) to verify/set:
-   `FRONTEND_URL=http://83.101.48.103`
-   `NEXT_PUBLIC_API_URL=http://83.101.48.103/api/v1`
-   `POSTGRES_PASSWORD`: *Set a strong password*

### Start Application
Run the containers in detached mode:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

## 4. Verification
1.  Check running containers:
    ```bash
    docker compose ps
    ```
2.  Access in Browser: `http://83.101.48.103`
3.  Test API Health: `http://83.101.48.103/api/v1/health`

## 5. Maintenance
-   **View Logs**: `docker compose logs -f`
-   **Update App**:
    ```bash
    git pull
    docker compose -f docker-compose.prod.yml up -d --build
    ```

## 6. Administration
### Create Superuser
To access the admin panel, create a superuser account:
```bash
docker exec -it cibn_backend_prod python -m app.cli create-superuser admin@cibn.org YourStrongPassword!
```
