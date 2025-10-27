# CIBN Digital Library

A comprehensive digital platform for the Chartered Institute of Bankers of Nigeria (CIBN), offering digital and physical resources with role-based access control.

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
