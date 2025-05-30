import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv
import logging
from routes import todos, habits, analytics, smart, ai_agents
# from routes import google_calendar  # Commenté temporairement
from datetime import datetime
from passlib.context import CryptContext
from prometheus_client import Counter, Histogram
import time
import sentry_sdk
from supabase_service import add_task

# Configuration de Sentry
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    traces_sample_rate=1.0,
    environment=os.getenv("ENVIRONMENT", "production")
)

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Métriques Prometheus
REQUEST_COUNT = Counter('http_requests_total', 'Total des requêtes HTTP', ['method', 'endpoint', 'status'])
REQUEST_LATENCY = Histogram('http_request_duration_seconds', 'Latence des requêtes HTTP')

# Configuration de sécurité
SECRET_KEY = os.getenv("SECRET_KEY", "votre_clé_secrète")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Chargement des variables d'environnement depuis le fichier .env
load_dotenv()

# Création de l'application FastAPI
app = FastAPI(
    title="Tasky API",
    description="API pour l'application Tasky",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware pour les métriques
@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    REQUEST_LATENCY.observe(duration)
    return response

# Modèles Pydantic
class TaskBase(BaseModel):
    text: str
    hashtags: List[str]
    eisenhower: str
    estimated_time: str
    deadline: str
    completed: bool = False

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Routes de base
@app.get("/")
async def root():
    return {"message": "Bienvenue sur l'API Tasky"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }

# Routes des tâches
@app.post("/api/tasks", response_model=Task)
async def create_task(task: TaskCreate):
    try:
        task_data = task.dict()
        if "user_id" not in task_data:
            task_data["user_id"] = "test_user"
        created_task = add_task(task_data)
        if not created_task:
            raise HTTPException(status_code=500, detail="Erreur lors de la création de la tâche")
        return created_task
    except Exception as e:
        logger.error(f"Erreur lors de la création de la tâche: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la création de la tâche")

# Inclusion des différents modules de routes avec préfixe /api
app.include_router(todos.router, prefix="/api", tags=["Todos"])
app.include_router(habits.router, prefix="/api", tags=["Habits"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(smart.router, prefix="/api", tags=["SMART"])
app.include_router(ai_agents.router, prefix="/api", tags=["AI Agents"])
# app.include_router(google_calendar.router)  # Commenté temporairement

# Montage des fichiers statiques de Vite
vite_dist_path = os.path.abspath("../frontend/dist")
if os.path.exists(f"{vite_dist_path}/assets"):
    app.mount("/assets", StaticFiles(directory=f"{vite_dist_path}/assets"), name="assets")
    logger.info(f"Fichiers statiques montés depuis {vite_dist_path}/assets")
else:
    logger.warning(f"Dossier {vite_dist_path}/assets non trouvé. Les fichiers statiques ne seront pas servis.")

# Route par défaut pour servir l'application React (doit être la dernière route)
@app.get("/{path:path}")
async def serve_react(path: str = ""):
    """Sert l'application React ou les fichiers statiques"""
    # Ne pas traiter les routes /api ici
    if path.startswith("api"):
        return {"detail": "Not Found"}
        
    # Vérifier d'abord dans le dossier dist (Vite)
    vite_path = os.path.join(vite_dist_path, path)
    if os.path.isfile(vite_path):
        return FileResponse(vite_path)
    
    # Si le chemin n'existe pas, servir index.html pour permettre le routage côté client
    # D'abord vérifier dans dist
    index_path = os.path.join(vite_dist_path, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    
    # Si aucun index.html n'existe, retourner un message
    return {"message": "L'application frontend n'est pas encore construite. Exécutez `npm run build` dans le dossier frontend."}

# Point d'entrée pour Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app_fastapi:app",
        host="0.0.0.0",
        port=8000,
        workers=4,
        proxy_headers=True,
        forwarded_allow_ips="*"
    ) 