"""
Routes pour la gestion des objectifs SMART
"""
from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any
import logging
from services.supabase_service import supabase_service


# Configuration du logging
logger = logging.getLogger(__name__)

# Création du router
router = APIRouter(tags=["smart"])


# API pour récupérer tous les objectifs SMART
@router.get("/smart-objectives")
async def get_smart_objectives():
    """Récupère tous les objectifs SMART de l'utilisateur"""
    try:
        objectives = await supabase_service.get_smart_objectives()
        return {"objectives": objectives}
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des objectifs SMART: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


# API pour récupérer un objectif SMART spécifique avec ses tâches
@router.get("/smart-objectives/{theme}")
async def get_smart_objective(theme: str):
    """Récupère un objectif SMART spécifique par son thème"""
    try:
        objective = await supabase_service.get_smart_objective_by_theme(theme)
        if not objective:
            raise HTTPException(status_code=404, detail=f"Objectif SMART pour '{theme}' non trouvé")
        
        # Récupérer les tâches associées
        tasks = await supabase_service.get_tasks_by_theme(theme)
        
        return {
            "theme": theme,
            "smart_objective": objective,
            "tasks": tasks
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'objectif SMART pour '{theme}': {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


# API pour mettre à jour un objectif SMART
@router.put("/smart-objectives/{theme}")
async def update_smart_objective(theme: str, objective_data: Dict[str, Any] = Body(...)):
    """Met à jour un objectif SMART existant"""
    try:
        updated = await supabase_service.update_smart_objective(theme, objective_data)
        if not updated:
            raise HTTPException(status_code=404, detail=f"Objectif SMART pour '{theme}' non trouvé")
        return {"success": True, "theme": theme}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour de l'objectif SMART pour '{theme}': {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


# API pour supprimer un objectif SMART et ses tâches associées
@router.delete("/smart-objectives/{theme}")
async def delete_smart_objective(theme: str):
    """Supprime un objectif SMART et ses tâches associées"""
    try:
        success = await supabase_service.delete_smart_objective(theme)
        if not success:
            raise HTTPException(status_code=404, detail=f"Objectif SMART pour '{theme}' non trouvé")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression de l'objectif SMART pour '{theme}': {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")
