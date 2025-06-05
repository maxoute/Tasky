#!/usr/bin/env python3
"""
Serveur FastAPI minimal pour tester les routes de recherche Brave Search et vidéos
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes.search_routes import router as search_router
from routes.videos_routes import router as videos_router

# Charger les variables d'environnement
load_dotenv()

# Créer l'application FastAPI
app = FastAPI(
    title="Test Mentor IA - Complet",
    description="API de test pour les routes de recherche Brave Search et gestion vidéos",
    version="0.1.0"
)

# Configuration CORS pour permettre les requêtes depuis le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(search_router)
app.include_router(videos_router)

# Route de santé de base
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Mentor IA Test Complet",
        "version": "0.1.0",
        "routes": ["search", "videos"]
    }

# Route racine
@app.get("/")
async def root():
    return {
        "message": "Mentor IA - API de test complète (recherches + vidéos)",
        "docs": "http://localhost:8000/docs"
    }

if __name__ == "__main__":
    print("🚀 Démarrage du serveur de test pour les recherches...")
    print("📱 API: http://localhost:8000")
    print("📚 Documentation: http://localhost:8000/docs")
    
    uvicorn.run(
        "test_search_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 