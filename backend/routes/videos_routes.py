"""
Routes FastAPI pour la gestion des vidéos
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import logging
from services.videos_service import videos_service
from services.brave_search_service import brave_search_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/videos", tags=["videos"])


class VideoCreate(BaseModel):
    title: str
    prompt: Optional[str] = None
    script: Optional[str] = None
    status: Optional[str] = "a_tourner"
    priority: Optional[str] = "medium"
    category: Optional[str] = "Orra Academy"
    deadline: Optional[str] = None
    estimated_duration: Optional[int] = None


class VideoUpdate(BaseModel):
    title: Optional[str] = None
    prompt: Optional[str] = None
    script: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    deadline: Optional[str] = None
    estimated_duration: Optional[int] = None
    enriched_with_search: Optional[bool] = None
    research_data: Optional[Dict[str, Any]] = None


class ScriptGenerationRequest(BaseModel):
    topic: str
    target_audience: Optional[str] = "débutants"
    include_trends: Optional[bool] = True
    include_personal_style: Optional[bool] = True


@router.get("/")
async def get_videos(
    status: Optional[str] = Query(None, description="Filtrer par statut (a_tourner, a_monter, a_publier, publie)")
) -> Dict[str, Any]:
    """
    Récupère toutes les vidéos, optionnellement filtrées par statut
    """
    try:
        videos = await videos_service.get_all_videos(status_filter=status)
        
        return {
            "success": True,
            "videos": videos,
            "count": len(videos),
            "filter": status
        }
        
    except Exception as e:
        logger.error(f"Erreur récupération vidéos: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


@router.get("/stats")
async def get_videos_statistics() -> Dict[str, Any]:
    """
    Récupère les statistiques des vidéos
    """
    try:
        stats = await videos_service.get_videos_stats()
        
        return {
            "success": True,
            "stats": stats
        }
        
    except Exception as e:
        logger.error(f"Erreur récupération statistiques: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


@router.get("/search")
async def search_videos(
    q: str = Query(..., description="Terme de recherche")
) -> Dict[str, Any]:
    """
    Recherche des vidéos par texte
    """
    try:
        if not q.strip():
            raise HTTPException(status_code=400, detail="Le terme de recherche ne peut pas être vide")
        
        videos = await videos_service.search_videos(q)
        
        return {
            "success": True,
            "videos": videos,
            "count": len(videos),
            "query": q
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur recherche vidéos: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


@router.post("/")
async def create_video(video_data: VideoCreate) -> Dict[str, Any]:
    """
    Crée une nouvelle vidéo
    """
    try:
        video = await videos_service.create_video(video_data.dict())
        
        return {
            "success": True,
            "video": video,
            "message": "Vidéo créée avec succès"
        }
        
    except Exception as e:
        logger.error(f"Erreur création vidéo: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


@router.get("/{video_id}")
async def get_video(video_id: str) -> Dict[str, Any]:
    """
    Récupère une vidéo par son ID
    """
    try:
        video = await videos_service.get_video_by_id(video_id)
        
        if not video:
            raise HTTPException(status_code=404, detail="Vidéo non trouvée")
        
        return {
            "success": True,
            "video": video
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur récupération vidéo {video_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


@router.put("/{video_id}")
async def update_video(video_id: str, updates: VideoUpdate) -> Dict[str, Any]:
    """
    Met à jour une vidéo
    """
    try:
        # Filtrer les valeurs None
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")
        
        video = await videos_service.update_video(video_id, update_data)
        
        if not video:
            raise HTTPException(status_code=404, detail="Vidéo non trouvée")
        
        return {
            "success": True,
            "video": video,
            "message": "Vidéo mise à jour avec succès"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur mise à jour vidéo {video_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


@router.delete("/{video_id}")
async def delete_video(video_id: str) -> Dict[str, Any]:
    """
    Supprime une vidéo
    """
    try:
        success = await videos_service.delete_video(video_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Vidéo non trouvée")
        
        return {
            "success": True,
            "message": "Vidéo supprimée avec succès"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur suppression vidéo {video_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


@router.post("/{video_id}/enrich")
async def enrich_video_with_search(
    video_id: str, 
    research_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Enrichit une vidéo avec des données de recherche
    """
    try:
        updates = {
            "research_data": research_data,
            "enriched_with_search": True
        }
        
        video = await videos_service.update_video(video_id, updates)
        
        if not video:
            raise HTTPException(status_code=404, detail="Vidéo non trouvée")
        
        return {
            "success": True,
            "video": video,
            "message": "Vidéo enrichie avec succès"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur enrichissement vidéo {video_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


@router.get("/health")
async def videos_health_check():
    """
    Vérifie la santé du service vidéos
    """
    try:
        # Test simple en récupérant les stats
        stats = await videos_service.get_videos_stats()
        
        return {
            "service": "Videos Service",
            "status": "healthy",
            "database_connected": not videos_service.offline_mode,
            "total_videos": stats.get("total_videos", 0)
        }
        
    except Exception as e:
        logger.error(f"Erreur health check vidéos: {e}")
        return {
            "service": "Videos Service",
            "status": "unhealthy",
            "database_connected": False,
            "error": str(e)
        }


@router.post("/generate-script")
async def generate_personalized_script(request: ScriptGenerationRequest) -> Dict[str, Any]:
    """
    Génère un script vidéo personnalisé basé sur des recherches en ligne
    et le profil de Maxens/Ryan de l'Orra Academy
    """
    try:
        if not request.topic.strip():
            raise HTTPException(status_code=400, detail="Le sujet ne peut pas être vide")
        
        # Générer le script personnalisé
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
            "topic": request.topic,
            "target_audience": request.target_audience,
            "generated_at": result["generated_at"],
            "message": "Script personnalisé généré avec succès"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur génération script pour '{request.topic}': {e}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}") 