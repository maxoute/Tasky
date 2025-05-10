"""
Routes pour les analyses et statistiques de l'application
"""
from fastapi import APIRouter
import json
import os
import logging
from openai import OpenAI
from services.supabase_service import supabase_service


# Configuration du logging
logger = logging.getLogger(__name__)

# Création du router
router = APIRouter(tags=["analytics"])


# API pour obtenir une revue hebdomadaire
@router.get("/weekly-review")
async def get_weekly_review():
    """
    Génère une revue hebdomadaire des tâches avec des statistiques 
    et une analyse personnalisée générée par IA
    """
    try:
        # Calculer les statistiques
        stats = await supabase_service.get_task_statistics()
        
        if not stats:
            return {
                "message": "Pas assez de données pour générer une revue hebdomadaire.",
                "statistics": {
                    "total_tasks": 0,
                    "completed_tasks": 0,
                    "pending_tasks": 0,
                    "completion_rate": 0,
                    "categories": {}
                },
                "smart_objectives": []
            }
        
        # Récupérer les objectifs SMART
        smart_objectives = await supabase_service.get_smart_objectives()
        
        # Utiliser OpenAI pour générer un résumé
        client = OpenAI(
            api_key=os.environ.get("OPENAI_API_KEY"),
        )
        
        response = client.chat.completions.create(
            model=os.environ.get("MODEL_OPENAI", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": f"""Tu es un coach en productivité qui analyse les données de tâches d'un utilisateur.
                
                Voici les statistiques de l'utilisateur pour cette semaine:
                {json.dumps(stats, ensure_ascii=False, indent=2)}
                
                Génère une analyse personnalisée en français avec:
                - Une évaluation des performances de la semaine
                - Identification des points forts
                - Suggestion d'amélioration pour la semaine prochaine
                - Un ton encourageant et motivant
                
                Réponds en texte simple, sans formatage JSON.
                """}
            ],
            temperature=0.7,
        )
        
        message = response.choices[0].message.content.strip()
        
        return {
            "message": message,
            "statistics": stats,
            "smart_objectives": smart_objectives
        }
            
    except Exception as e:
        logger.error(f"Erreur lors de la génération de la revue hebdomadaire: {str(e)}")
        return {
            "message": "Une erreur s'est produite lors de la génération de la revue hebdomadaire.",
            "statistics": {
                "total_tasks": 0,
                "completed_tasks": 0,
                "pending_tasks": 0,
                "completion_rate": 0,
                "categories": {}
            },
            "smart_objectives": []
        }
