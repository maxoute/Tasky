import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import logging
import sys
from pathlib import Path
from routes import todos, habits, analytics, smart, ai_agents

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

# Chargement des variables d'environnement depuis le fichier .env
load_dotenv()

# Création de l'application FastAPI
app = FastAPI(
    title="Mentor IA API",
    description="API pour l'application Mentor IA",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route de santé de l'API
@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "API opérationnelle"}

# Inclusion des différents modules de routes avec préfixe /api
app.include_router(todos.router, prefix="/api", tags=["Todos"])
app.include_router(habits.router, prefix="/api", tags=["Habits"])
app.include_router(analytics.router, prefix="/api", tags=["Analytics"])
app.include_router(smart.router, prefix="/api", tags=["SMART"])
app.include_router(ai_agents.router, prefix="/api", tags=["AI Agents"])

# Chemin vers le build React
react_build_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend/build')

# Montage des fichiers statiques si le dossier existe
if os.path.exists(react_build_path):
    app.mount("/static", StaticFiles(directory=f"{react_build_path}/static"), name="static")

# Route par défaut pour servir l'application React (doit être la dernière route)
@app.get("/{path:path}")
async def serve_react(path: str = ""):
    """Sert l'application React ou les fichiers statiques"""
    # Ne pas traiter les routes /api ici
    if path.startswith("api"):
        return {"detail": "Not Found"}
        
    # Vérifier si le chemin existe dans le dossier static
    full_path = os.path.join(react_build_path, path)
    
    # Si le chemin est un fichier qui existe, le servir
    if os.path.isfile(full_path):
        return FileResponse(full_path)
    
    # Sinon, servir index.html pour permettre le routage côté client
    index_path = os.path.join(react_build_path, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    
    # Si index.html n'existe pas, simplement retourner un message
    return {"message": "L'application React n'est pas encore construite. Exécutez `npm run build` dans le dossier frontend."}

# Point d'entrée pour Uvicorn
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app_fastapi:app", host="0.0.0.0", port=port, reload=True) 