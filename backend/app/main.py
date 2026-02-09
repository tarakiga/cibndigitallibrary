from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
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

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
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

# Add custom middleware to force CORS headers on ALL responses
@app.middleware("http")
async def add_cors_header(request: Request, call_next):
    response = await call_next(request)
    origin = request.headers.get("origin", "")
    
    # Always add CORS headers for allowed origins
    allowed_hosts = ["localhost", "elibrary.cibng.org"]
    if any(host in origin for host in allowed_hosts):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Content-Length", "X-Requested-With"],
    max_age=600,  # Cache preflight response for 10 minutes
)

# Custom exception handlers to ensure CORS headers on all responses
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions with CORS headers"""
    origin = request.headers.get("origin")
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}, Origin: {origin}")
    
    response = JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )
    
    # Add CORS headers
    allowed_origins = settings.CORS_ORIGINS
    logger.debug(f"Allowed origins: {allowed_origins}")
    if origin and origin in allowed_origins:
        logger.debug(f"Adding CORS headers for origin: {origin}")
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
    else:
        logger.warning(f"Origin {origin} not in allowed origins")
    
    return response

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with CORS headers"""
    origin = request.headers.get("origin")
    
    response = JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )
    
    # Add CORS headers
    allowed_origins = settings.CORS_ORIGINS
    if origin and origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions with CORS headers"""
    origin = request.headers.get("origin")
    
    # Log the error
    # Log the error
    logger.error(f"Unhandled exception: {exc}")
    logger.error(traceback.format_exc())
    
    response = JSONResponse(
        status_code=500,
        content={"detail": f"Internal server error: {str(exc)}"},
    )
    
    # Add CORS headers
    allowed_origins = settings.CORS_ORIGINS
    if origin and origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
    
    return response

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
