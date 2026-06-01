from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pathlib import Path
import os
import traceback
import logging
from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
from app.api.routes import auth, content, orders, admin_settings, user_content, upload, progress
from app.db.session import engine, Base, wait_for_db

# Only expose interactive API docs / OpenAPI schema in development.
_is_dev = settings.APP_ENV == "development"

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if _is_dev else None,
    docs_url="/docs" if _is_dev else None,
    redoc_url="/redoc" if _is_dev else None,
)

# Create database tables on startup (skip in test environment)
@app.on_event("startup")
def startup_event():
    if os.getenv("TESTING") != "true":
        logger.info("Waiting for database to be ready...")
        wait_for_db()
        logger.info("Database ready, creating tables...")
        Base.metadata.create_all(bind=engine)
    # Log CORS origins
    logger.info(f"CORS Origins: {settings.CORS_ORIGINS}")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Content-Length", "X-Requested-With"],
    max_age=600,
)

# Generic exception handler for unhandled errors
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

# Create uploads directory
uploads_dir = Path(settings.UPLOAD_DIR)
uploads_dir.mkdir(exist_ok=True)

# Serve static files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API routes
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(content.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(admin_settings.router, prefix=settings.API_V1_STR)
app.include_router(user_content.router, prefix=settings.API_V1_STR)
app.include_router(upload.router, prefix=settings.API_V1_STR)
app.include_router(progress.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "message": "CIBN Digital Library API",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
