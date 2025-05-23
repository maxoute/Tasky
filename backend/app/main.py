"""Point d'entrée FastAPI (production/dev)"""

import os
import time
from datetime import datetime
# noqa

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from prometheus_client import Counter, Histogram
import sentry_sdk

from app.config import settings

# Routers existants (à migrer ensuite)
from routes import todos, habits, analytics, smart, ai_agents  # type: ignore

# --- Observabilité & monitoring ------------------------------------------------

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    traces_sample_rate=1.0,
    environment=os.getenv("ENVIRONMENT", "production"),
)

REQUEST_COUNT = Counter(
    "http_requests_total", "Total des requêtes HTTP", ["method", "endpoint", "status"]
)
REQUEST_LATENCY = Histogram(
    "http_request_duration_seconds", "Latence des requêtes HTTP"
)

# --- Application ---------------------------------------------------------------

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware Prometheus
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    REQUEST_COUNT.labels(
        method=request.method, endpoint=request.url.path, status=response.status_code
    ).inc()
    REQUEST_LATENCY.observe(duration)
    return response

# --- Routes de base ------------------------------------------------------------

@app.get("/")
async def root():
    return {"message": f"Bienvenue sur {settings.PROJECT_NAME}"}


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": settings.VERSION,
    }

# --- Inclusion des routers existants ------------------------------------------

app.include_router(todos.router, prefix="/api", tags=["Todos"])
app.include_router(habits.router, prefix="/api", tags=["Habits"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(smart.router, prefix="/api", tags=["SMART"])
app.include_router(ai_agents.router, prefix="/api", tags=["AI Agents"])

# --- Static React build --------------------------------------------------------

REACT_BUILD_PATH = (
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "frontend", "build")
)

if os.path.exists(REACT_BUILD_PATH):
    app.mount("/static", StaticFiles(directory=f"{REACT_BUILD_PATH}/static"), name="static")


@app.get("/{full_path:path}")
async def serve_react(full_path: str = ""):
    """Servez l'application React ou index.html pour le routage côté client."""
    if full_path.startswith("api"):
        return {"detail": "Not Found"}

    requested_path = os.path.join(REACT_BUILD_PATH, full_path)
    if os.path.isfile(requested_path):
        return FileResponse(requested_path)

    index_html = os.path.join(REACT_BUILD_PATH, "index.html")
    if os.path.isfile(index_html):
        return FileResponse(index_html)

    return {
        "message": "L'application React n'est pas encore construite. Exécutez `npm run build` dans le dossier frontend."} 