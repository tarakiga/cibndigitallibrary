#!/usr/bin/env python3
"""
Simple startup script for the CIBN Digital Library Backend
"""
import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set environment variables
os.environ["PYTHONPATH"] = str(backend_dir)

if __name__ == "__main__":
    try:
        import uvicorn
        from app.main import app
        from app.core.config import settings
        
        print("Starting CIBN Digital Library Backend...")
        print("Backend directory:", backend_dir)
        print("Current working directory:", os.getcwd())
        print("Database URL:", settings.DATABASE_URL)
        print("Server will be available at: http://localhost:8000")
        print("API Documentation: http://localhost:8000/api/v1/docs")
        print("Health Check: http://localhost:8000/health")
        print("=" * 50)
        
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            reload_dirs=[str(backend_dir)],
            log_level="info"
        )
    except ImportError as e:
        print(f"Import error: {e}")
        print("Make sure you're in the backend directory and all dependencies are installed")
        sys.exit(1)
