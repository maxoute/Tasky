"""
Routes pour la communication bidirectionnelle avec N8N
"""
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/n8n", tags=["n8n"])


class N8NResponse(BaseModel):
    """Modèle pour les réponses de N8N"""
    request_id: Optional[str] = None
    result_type: str  # "video_script", "analysis", "error", etc.
    content: str
    metadata: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None


class N8NNotification(BaseModel):
    """Modèle pour les notifications de N8N"""
    event_type: str  # "task_completed", "error", "progress_update"
    original_prompt: Optional[str] = None
    result: Any
    status: str  # "success", "error", "in_progress"
    timestamp: Optional[str] = None


@router.post("/response")
async def receive_n8n_response(response: N8NResponse):
    """
    Endpoint pour recevoir les réponses de N8N
    """
    try:
        logger.info(f"📨 Réponse reçue de N8N: {response.result_type}")
        logger.info(f"📝 Contenu: {response.content[:100]}...")
        
        # Ici vous pouvez traiter la réponse selon le type
        if response.result_type == "video_script":
            # Traitement spécifique pour les scripts vidéo
            return await handle_video_script_response(response)
        
        elif response.result_type == "analysis":
            # Traitement pour les analyses
            return await handle_analysis_response(response)
        
        elif response.result_type == "error":
            # Traitement des erreurs
            logger.error(f"❌ Erreur reportée par N8N: {response.content}")
            return {"status": "error_logged", "message": "Erreur enregistrée"}
        
        else:
            # Traitement générique
            return await handle_generic_response(response)
            
    except Exception as e:
        logger.error(f"❌ Erreur lors du traitement de la réponse N8N: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


@router.post("/notification")
async def receive_n8n_notification(notification: N8NNotification):
    """
    Endpoint pour recevoir des notifications de N8N
    """
    try:
        logger.info(f"🔔 Notification N8N: {notification.event_type}")
        
        # Traitement selon le type d'événement
        if notification.event_type == "task_completed":
            logger.info(f"✅ Tâche terminée: {notification.original_prompt}")
            
        elif notification.event_type == "error":
            logger.error(f"❌ Erreur N8N: {notification.result}")
            
        elif notification.event_type == "progress_update":
            logger.info(f"🔄 Progression: {notification.result}")
        
        return {
            "status": "notification_received",
            "event_type": notification.event_type,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur lors du traitement de la notification N8N: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


async def handle_video_script_response(response: N8NResponse):
    """Traite les réponses de script vidéo de N8N"""
    try:
        # Ici vous pourriez sauvegarder le script en base de données
        # ou l'envoyer vers une interface en temps réel
        
        logger.info(f"🎬 Script vidéo généré par N8N:")
        logger.info(f"📝 Longueur: {len(response.content)} caractères")
        
        # Exemple: sauvegarder en base ou notifier l'interface
        return {
            "status": "video_script_processed",
            "request_id": response.request_id,
            "script_length": len(response.content),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur traitement script vidéo: {str(e)}")
        return {"status": "error", "message": str(e)}


async def handle_analysis_response(response: N8NResponse):
    """Traite les réponses d'analyse de N8N"""
    try:
        logger.info(f"📊 Analyse reçue de N8N")
        
        return {
            "status": "analysis_processed",
            "request_id": response.request_id,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur traitement analyse: {str(e)}")
        return {"status": "error", "message": str(e)}


async def handle_generic_response(response: N8NResponse):
    """Traite les réponses génériques de N8N"""
    try:
        logger.info(f"📦 Réponse générique de N8N: {response.result_type}")
        
        return {
            "status": "response_processed",
            "result_type": response.result_type,
            "request_id": response.request_id,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Erreur traitement générique: {str(e)}")
        return {"status": "error", "message": str(e)}


@router.get("/status")
async def get_n8n_status():
    """Endpoint pour vérifier le statut de la communication N8N"""
    return {
        "status": "ready",
        "endpoints": {
            "response": "/api/n8n/response",
            "notification": "/api/n8n/notification"
        },
        "timestamp": datetime.now().isoformat()
    } 