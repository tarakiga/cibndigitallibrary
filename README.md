# CIBN Digital Library

A comprehensive digital platform for the Chartered Institute of Bankers of Nigeria (CIBN), offering digital and physical resources with role-based access control.

**Status**: ✅ Live in Production

## Features

- 📚 **Multi-format Content**: PDFs, videos, audio files, e-books, and physical items
- 🔐 **Role-Based Access**: Public users, CIBN members, and administrators
- 💳 **Secure Payments**: Paystack integration for seamless transactions
- 🎨 **Premium UI**: Glassmorphism design with fluid animations
- 🔍 **Advanced Search**: Filter by type, category, and price range

## Tech Stack

- **Frontend**: React 18 + Vite + shadcn/ui + TailwindCSS
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Payments**: Paystack API
- **Authentication**: JWT tokens

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (or use Docker)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Install dependencies
uv pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup (Docker)

```bash
# Start PostgreSQL container
docker-compose up -d
```

## Project Structure

```
LIBRARY2/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Configuration
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── lib/            # Utilities
│   │   └── styles/         # CSS/Tailwind
│   └── package.json
├── docs/                   # Documentation
└── uploads/                # File uploads
```

## Documentation

See the `docs/` directory for comprehensive documentation:

- [Getting Started](docs/getting-started.md)
- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Deployment](docs/deployment.md)

## License

© 2025 Chartered Institute of Bankers of Nigeria. All rights reserved.

## Environment Variables

No `.env*` files are committed — they exist only locally and on the server.
Create a `.env` in the project root (used by `docker-compose.prod.yml`) and
generate fresh secrets before deploying.

**Required**

| Variable | Description |
|---|---|
| `APP_ENV` | `production` (or `development` locally) |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | PostgreSQL container credentials |
| `DATABASE_URL` | `postgresql://<user>:<pass>@postgres:5432/<db>` (escape a literal `$` as `$$`) |
| `SECRET_KEY` | JWT signing key, 64+ random chars |
| `FRONTEND_URL` | e.g. `https://elibrary.cibng.org` |
| `NEXT_PUBLIC_API_URL` | e.g. `https://elibrary.cibng.org/api/v1` |
| `CORS_ORIGINS` | JSON array of allowed origins (no wildcard) |

**Optional**

| Variable | Description |
|---|---|
| `ALGORITHM` / `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT alg (default `HS256`) / token lifetime |
| `UPLOAD_DIR` / `MAX_FILE_SIZE` | upload path / max size in bytes |
| `CIBN_DB_SERVER` `CIBN_DB_DATABASE` `CIBN_DB_USERNAME` `CIBN_DB_PASSWORD` `VIEW_NAME` | external CIBN member DB (member login); leave blank to disable |

**Managed in Admin Settings (NOT env):** Paystack keys (Admin → Settings → Payments) and SMTP/email (Admin → Settings → Email).

**Frontend:** `frontend/.env` needs `NEXT_PUBLIC_API_URL`.

**Generate secrets**

```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"   # SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(24))"   # POSTGRES_PASSWORD (URL-safe)
# or: openssl rand -base64 48
```
