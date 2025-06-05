from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging
from services.brave_search_service import brave_search_service
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/search", tags=["search"])

class SearchRequest(BaseModel):
    query: str
    count: Optional[int] = 10
    country: Optional[str] = "FR"
    search_lang: Optional[str] = "fr"
    freshness: Optional[str] = "pm"

class VideoResearchRequest(BaseModel):
    video_prompt: str

class TrendsRequest(BaseModel):
    topic: str

class VideoScriptRequest(BaseModel):
    topic: str
    target_audience: str

@router.post("/general")
async def search_general(request: SearchRequest) -> Dict[str, Any]:
    """
    Effectue une recherche générale avec Brave Search
    """
    try:
        results = brave_search_service.search(
            query=request.query,
            count=request.count,
            country=request.country,
            search_lang=request.search_lang,
            freshness=request.freshness
        )
        
        if "error" in results:
            raise HTTPException(status_code=400, detail=results["error"])
        
        return {
            "success": True,
            "data": results,
            "query": request.query
        }
        
    except Exception as e:
        logger.error(f"Erreur recherche générale: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

@router.post("/video-research")
async def search_video_content(request: VideoResearchRequest) -> Dict[str, Any]:
    """
    Recherche spécifique pour enrichir le contenu d'une vidéo
    """
    try:
        if not request.video_prompt.strip():
            raise HTTPException(status_code=400, detail="Le prompt de vidéo ne peut pas être vide")
        
        results = brave_search_service.search_for_video_content(request.video_prompt)
        
        if "error" in results:
            raise HTTPException(status_code=400, detail=results["error"])
        
        return {
            "success": True,
            "data": results,
            "video_prompt": request.video_prompt
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur recherche vidéo: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

@router.post("/trends")
async def search_trends(request: TrendsRequest) -> Dict[str, Any]:
    """
    Recherche des tendances et insights sur un sujet
    """
    try:
        if not request.topic.strip():
            raise HTTPException(status_code=400, detail="Le sujet ne peut pas être vide")
        
        results = brave_search_service.search_trends_and_insights(request.topic)
        
        return {
            "success": True,
            "data": results,
            "topic": request.topic
        }
        
    except Exception as e:
        logger.error(f"Erreur recherche tendances: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

@router.get("/health")
async def search_health():
    """
    Vérifie la santé du service de recherche
    """
    try:
        # Test simple avec une requête basique
        test_result = brave_search_service.search("test", count=1)
        
        has_api_key = brave_search_service.api_key is not None
        is_working = "error" not in test_result
        
        return {
            "service": "Brave Search",
            "has_api_key": has_api_key,
            "is_working": is_working,
            "status": "healthy" if has_api_key and is_working else "degraded"
        }
        
    except Exception as e:
        logger.error(f"Erreur health check recherche: {e}")
        return {
            "service": "Brave Search",
            "has_api_key": brave_search_service.api_key is not None,
            "is_working": False,
            "status": "unhealthy",
            "error": str(e)
        }

@router.post("/video/script-with-webhook")
async def generate_video_script_with_webhook(request: VideoScriptRequest):
    """
    Génère un script vidéo personnalisé et l'envoie vers N8N via webhook
    """
    try:
        # Générer le script avec webhook automatique
        result = brave_search_service.generate_personalized_video_script(
            topic=request.topic,
            target_audience=request.target_audience
        )
        
        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return {
            "success": True,
            "script": result["script"],
            "research_data": result["research_data"],
            "webhook_status": result.get("webhook_status", {"status": "not_configured"}),
            "generated_at": result["generated_at"]
        }
        
    except Exception as e:
        logger.error(f"Erreur génération script avec webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@router.post("/test-webhook")
async def test_n8n_webhook():
    """
    Teste la connexion webhook avec N8N
    """
    try:
        test_data = {
            "test": True,
            "message": "Test de connexion depuis Orra Academy",
            "timestamp": datetime.now().isoformat(),
            "source": "brave_search_service_test"
        }
        
        webhook_result = brave_search_service.send_to_n8n(
            data=test_data,
            event_type="webhook_test"
        )
        
        return {
            "success": True,
            "webhook_result": webhook_result,
            "test_data": test_data
        }
        
    except Exception as e:
        logger.error(f"Erreur test webhook: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@router.get("/webhook/status")
async def get_webhook_status():
    """
    Vérifie le statut de la configuration webhook N8N
    """
    return {
        "webhook_enabled": brave_search_service.n8n_enabled,
        "webhook_configured": bool(brave_search_service.n8n_webhook_url),
        "webhook_url": brave_search_service.n8n_webhook_url if brave_search_service.n8n_webhook_url else "Non configurée"
    }

@router.post("/video/send-prompt")
async def send_video_prompt_only(request: VideoScriptRequest):
    """
    Envoie uniquement le prompt vidéo vers N8N sans générer le script
    """
    try:
        # Envoyer juste le prompt vers N8N
        webhook_result = brave_search_service.send_video_prompt_to_n8n(
            topic=request.topic,
            target_audience=request.target_audience
        )
        
        return {
            "success": True,
            "message": "Prompt vidéo envoyé vers N8N",
            "topic": request.topic,
            "target_audience": request.target_audience,
            "webhook_result": webhook_result,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Erreur envoi prompt: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}") 