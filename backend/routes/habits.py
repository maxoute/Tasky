"""
Routes pour la gestion des habitudes utilisateur
"""
from fastapi import APIRouter, HTTPException, Body, Query
from typing import Dict, Any, Optional
import logging
from services.habits_service import habits_service


# Configuration du logging
logger = logging.getLogger(__name__)

# Création du router
router = APIRouter(tags=["habits"])


# API pour récupérer les habitudes d'un utilisateur
@router.get("/habits")
async def get_habits(user_id: str = Query(..., description="ID de l'utilisateur")):
    """Récupère toutes les habitudes d'un utilisateur"""
    try:
        habits = await habits_service.get_user_habits(user_id)
        return {"habits": habits}
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des habitudes: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


# API pour ajouter une habitude
@router.post("/habits")
async def add_habit(habit_data: Dict[str, Any] = Body(...)):
    """Ajoute une nouvelle habitude"""
    try:
        habit = await habits_service.add_habit(habit_data)
        if not habit:
            raise HTTPException(status_code=400, detail="Données d'habitude invalides")
        return {"habit": habit}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'ajout d'une habitude: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


# API pour mettre à jour une habitude
@router.put("/habits/{habit_id}")
async def update_habit(habit_id: int, habit_data: Dict[str, Any] = Body(...)):
    """Met à jour une habitude existante"""
    try:
        habit = await habits_service.update_habit(habit_id, habit_data)
        if not habit:
            raise HTTPException(status_code=404, detail=f"Habitude {habit_id} non trouvée")
        return {"habit": habit}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour de l'habitude {habit_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


# API pour supprimer une habitude
@router.delete("/habits/{habit_id}")
async def delete_habit(habit_id: int):
    """Supprime une habitude et ses entrées associées"""
    try:
        success = await habits_service.delete_habit(habit_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Habitude {habit_id} non trouvée")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression de l'habitude {habit_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


# API pour récupérer les entrées d'une habitude
@router.get("/habits/{habit_id}/entries")
async def get_habit_entries(
    habit_id: int,
    start_date: Optional[str] = Query(None, description="Date de début (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Date de fin (YYYY-MM-DD)")
):
    """Récupère les entrées d'une habitude sur une période donnée"""
    try:
        entries = await habits_service.get_habit_entries(habit_id, start_date, end_date)
        return {"entries": entries}
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des entrées pour l'habitude {habit_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


# API pour ajouter une entrée d'habitude
@router.post("/habits/entries")
async def add_habit_entry(entry_data: Dict[str, Any] = Body(...)):
    """Ajoute ou met à jour une entrée pour une habitude"""
    try:
        entry = await habits_service.add_habit_entry(entry_data)
        if not entry:
            raise HTTPException(status_code=400, detail="Données d'entrée invalides")
        return {"entry": entry}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'ajout d'une entrée d'habitude: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


# API pour supprimer une entrée d'habitude
@router.delete("/habits/entries/{entry_id}")
async def delete_habit_entry(entry_id: int):
    """Supprime une entrée d'habitude"""
    try:
        success = await habits_service.delete_habit_entry(entry_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Entrée {entry_id} non trouvée")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression de l'entrée {entry_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


# API pour obtenir des statistiques sur les habitudes
@router.get("/habits/stats")
async def get_habit_stats(
    user_id: str = Query(..., description="ID de l'utilisateur"),
    habit_id: Optional[int] = Query(None, description="ID d'une habitude spécifique"),
    period: str = Query("month", description="Période (week, month, year)")
):
    """Calcule des statistiques pour les habitudes d'un utilisateur"""
    try:
        stats = await habits_service.get_habit_stats(user_id, habit_id, period)
        return stats
    except Exception as e:
        logger.error(f"Erreur lors du calcul des statistiques: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")
