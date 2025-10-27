# Getting Started

Welcome to the CIBN Digital Library! This guide will help you set up and run the application on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher) - [Download](https://nodejs.org/)
- **Python** (version 3.11 or higher) - [Download](https://python.org/)
- **PostgreSQL** (version 15 or higher) - [Download](https://postgresql.org/)

## Project Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd LIBRARY2
```

### 2. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the next available port).

### 3. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
# Windows PowerShell
python -m venv venv
.\venv\Scripts\Activate.ps1

# macOS/Linux
python -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
uv pip install -r requirements.txt
```

Set up the database:

```bash
# Run migrations
alembic upgrade head
```

Start the backend server:

```bash
uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8000`.

### 4. Database Setup (Optional - Using Docker)

If you prefer to use Docker for PostgreSQL:

```bash
docker-compose up -d
```

This will start a PostgreSQL container with the necessary configuration.

## Development Workflow

### Frontend Development

- **Development**: `npm run dev` - Starts the development server with hot reload
- **Build**: `npm run build` - Creates production build in `dist/` directory  
- **Preview**: `npm run preview` - Preview production build locally
- **Lint**: `npm run lint` - Check code quality

### Backend Development

- **Development**: `uvicorn app.main:app --reload` - Starts development server with auto-reload
- **Testing**: `pytest` - Run test suite
- **Migrations**: `alembic revision --autogenerate -m "description"` - Create new migration

## Project Structure

```
LIBRARY2/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities
│   │   └── App.tsx          # Main app component
│   ├── public/              # Static assets
│   └── package.json         # Frontend dependencies
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── models/         # Database models
│   │   └── main.py         # FastAPI app
│   └── requirements.txt    # Backend dependencies
└── docs/                   # Documentation
```

## Common Issues

### Frontend Issues

**Port Already in Use**: Vite will automatically try the next available port.

**Build Errors**: Make sure all dependencies are installed with `npm install`.

**CSS Issues**: Ensure TailwindCSS is properly configured in `tailwind.config.js`.

### Backend Issues

**Database Connection**: Verify PostgreSQL is running and credentials are correct.

**Migration Errors**: Check database schema and run `alembic upgrade head`.

**Import Errors**: Ensure virtual environment is activated and dependencies are installed.

## Next Steps

1. **Explore the Code**: Familiarize yourself with the component structure and API endpoints
2. **Run Tests**: Execute the test suite to ensure everything is working
3. **Read Documentation**: Check out the other documentation files for detailed information
4. **Start Developing**: Begin implementing new features or fixing issues

## Getting Help

- Check the [Architecture](architecture.md) documentation for technical details
- Review the [API](api.md) documentation for backend endpoints  
- Refer to [handoff.md](../handoff.md) for comprehensive project information

Happy coding! 🚀