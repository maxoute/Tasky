"""
Routes pour la gestion des habitudes utilisateur
"""
from fastapi import APIRouter, HTTPException, Body, Query
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging
from services.habits_service import habits_service
from pydantic import BaseModel


# Configuration du logging
logger = logging.getLogger(__name__)


# Création du router
router = APIRouter(tags=["habits"])


# Modèles Pydantic pour les habitudes
class HabitStreak(BaseModel):
    habit_id: int
    current_streak: int
    longest_streak: int
    last_completion_date: Optional[datetime]
    completion_rate: float


class HabitStats(BaseModel):
    total_habits: int
    active_habits: int
    streaks: List[HabitStreak]
    completion_rate: float
    most_consistent_habit: Optional[Dict[str, Any]]
    needs_attention: List[Dict[str, Any]]


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
    period: str = Query("week", description="Période (week, month, year)"),
    habit_id: Optional[int] = Query(None, description="ID d'une habitude spécifique")
):
    """Récupère les statistiques des habitudes"""
    try:
        stats = await habits_service.get_detailed_habit_stats(user_id, period)
        return stats
    except Exception as e:
        logger.error(f"Erreur lors du calcul des statistiques: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Nouvelle route pour obtenir les streaks d'une habitude
@router.get("/habits/{habit_id}/streak", response_model=HabitStreak)
async def get_habit_streak(
    habit_id: int,
    user_id: str = Query(..., description="ID de l'utilisateur")
):
    """Récupère les statistiques de streak pour une habitude spécifique"""
    try:
        streak = await habits_service.calculate_habit_streak(habit_id, user_id)
        if not streak:
            raise HTTPException(status_code=404, detail=f"Streak non trouvé pour l'habitude {habit_id}")
        return streak
    except Exception as e:
        logger.error(f"Erreur lors du calcul du streak pour l'habitude {habit_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


# Nouvelle route pour obtenir un rapport hebdomadaire des habitudes
@router.get("/habits/weekly-report")
async def get_weekly_habit_report(
    user_id: str = Query(..., description="ID de l'utilisateur")
):
    """Génère un rapport hebdomadaire personnalisé des habitudes"""
    try:
        # Récupérer les statistiques de la semaine
        weekly_stats = await habits_service.get_detailed_habit_stats(user_id, "week")
        
        # Récupérer les habitudes qui ont besoin d'attention
        habits_needing_attention = await habits_service.get_habits_needing_attention(user_id)
        
        # Générer un rapport personnalisé avec l'IA
        report = await habits_service.generate_weekly_report(
            user_id=user_id,
            weekly_stats=weekly_stats,
            habits_needing_attention=habits_needing_attention
        )
        
        return {
            "weekly_stats": weekly_stats,
            "habits_needing_attention": habits_needing_attention,
            "report": report
        }
    except Exception as e:
        logger.error(f"Erreur lors de la génération du rapport hebdomadaire: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")


# Nouvelle route pour mettre à jour le streak d'une habitude
@router.post("/habits/{habit_id}/complete")
async def complete_habit(
    habit_id: int,
    user_id: str = Query(..., description="ID de l'utilisateur"),
    notes: Optional[str] = Query(None, description="Notes optionnelles sur la complétion")
):
    """Marque une habitude comme complétée pour aujourd'hui et met à jour son streak"""
    try:
        completion = await habits_service.complete_habit(habit_id, user_id, notes)
        if not completion:
            raise HTTPException(status_code=404, detail=f"Habitude {habit_id} non trouvée")
        
        # Calculer le nouveau streak
        streak = await habits_service.calculate_habit_streak(habit_id, user_id)
        
        return {
            "completion": completion,
            "streak": streak,
            "message": "Habitude complétée avec succès"
        }
    except Exception as e:
        logger.error(f"Erreur lors de la complétion de l'habitude {habit_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")
