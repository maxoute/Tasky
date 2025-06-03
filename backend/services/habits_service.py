"""
Service pour la gestion des habitudes utilisateur
"""
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
import os
from openai import OpenAI
from services.supabase_service import supabase_service
from supabase import create_client, Client

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("backend.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialisation du client Supabase
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

# Vérification des variables d'environnement
supabase = None
if url and key:
    try:
        supabase: Client = create_client(url, key)
        logger.info("Connexion Supabase établie avec succès")
    except Exception as e:
        logger.error(f"Erreur lors de la connexion à Supabase: {str(e)}")
else:
    logger.warning("Variables d'environnement SUPABASE_URL ou SUPABASE_KEY non définies. Fonctionnalités Supabase désactivées.")


class HabitsService:
    def __init__(self):
        self.openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    
    async def get_user_habits(self, user_id: str) -> List[Dict[str, Any]]:
        """Récupère toutes les habitudes d'un utilisateur"""
        try:
            habits = await supabase_service.get_user_habits(user_id)
            return habits
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des habitudes: {str(e)}")
            raise
    
    async def add_habit(self, habit_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ajoute une nouvelle habitude"""
        try:
            # Ajouter des champs par défaut
            habit_data.update({
                "created_at": datetime.now().isoformat(),
                "streak": 0,
                "longest_streak": 0,
                "last_completion_date": None,
                "completion_count": 0
            })
            
            habit = await supabase_service.add_habit(habit_data)
            return habit
        except Exception as e:
            logger.error(f"Erreur lors de l'ajout de l'habitude: {str(e)}")
            raise
    
    async def calculate_habit_streak(self, habit_id: int, user_id: str) -> Dict[str, Any]:
        """Calcule le streak actuel et le plus long streak pour une habitude"""
        try:
            # Récupérer toutes les complétions de l'habitude
            completions = await supabase_service.get_habit_completions(habit_id)
            if not completions:
                return None
            
            # Trier les complétions par date
            completions.sort(key=lambda x: x["completion_date"])
            
            # Calculer le streak actuel
            current_streak = 0
            longest_streak = 0
            temp_streak = 0
            last_date = None
            
            for completion in completions:
                completion_date = datetime.fromisoformat(completion["completion_date"])
                
                if last_date is None:
                    current_streak = 1
                    temp_streak = 1
                else:
                    # Vérifier si la complétion est consécutive (au plus 2 jours d'écart)
                    days_diff = (completion_date - last_date).days
                    if days_diff <= 2:
                        temp_streak += 1
                        if temp_streak > current_streak:
                            current_streak = temp_streak
                    else:
                        temp_streak = 1
                
                if temp_streak > longest_streak:
                    longest_streak = temp_streak
                
                last_date = completion_date
            
            # Calculer le taux de complétion
            total_days = (datetime.now() - datetime.fromisoformat(completions[0]["completion_date"])).days + 1
            completion_rate = len(completions) / total_days if total_days > 0 else 0
            
            return {
                "habit_id": habit_id,
                "current_streak": current_streak,
                "longest_streak": longest_streak,
                "last_completion_date": last_date.isoformat() if last_date else None,
                "completion_rate": completion_rate
            }
        except Exception as e:
            logger.error(f"Erreur lors du calcul du streak: {str(e)}")
            raise
    
    async def get_detailed_habit_stats(self, user_id: str, period: str = "month") -> Dict[str, Any]:
        """Récupère des statistiques détaillées sur les habitudes"""
        try:
            # Récupérer toutes les habitudes de l'utilisateur
            habits = await self.get_user_habits(user_id)
            
            # Calculer la période de début
            now = datetime.now()
            if period == "week":
                start_date = now - timedelta(days=7)
            elif period == "month":
                start_date = now - timedelta(days=30)
            else:  # year
                start_date = now - timedelta(days=365)
            
            # Calculer les statistiques pour chaque habitude
            streaks = []
            total_completions = 0
            total_possible = 0
            most_consistent = None
            needs_attention = []
            
            for habit in habits:
                streak = await self.calculate_habit_streak(habit["id"], user_id)
                if streak:
                    streaks.append(streak)
                    
                    # Mettre à jour les totaux
                    total_completions += streak["completion_rate"] * (now - start_date).days
                    total_possible += (now - start_date).days
                    
                    # Vérifier si c'est l'habitude la plus consistante
                    if not most_consistent or streak["completion_rate"] > most_consistent["completion_rate"]:
                        most_consistent = {
                            "habit_id": habit["id"],
                            "name": habit["name"],
                            "completion_rate": streak["completion_rate"]
                        }
                    
                    # Vérifier si l'habitude a besoin d'attention
                    if streak["current_streak"] < 3 and streak["completion_rate"] < 0.5:
                        needs_attention.append({
                            "habit_id": habit["id"],
                            "name": habit["name"],
                            "current_streak": streak["current_streak"],
                            "completion_rate": streak["completion_rate"]
                        })
            
            # Calculer le taux de complétion global
            overall_completion_rate = total_completions / total_possible if total_possible > 0 else 0
            
            return {
                "total_habits": len(habits),
                "active_habits": len([h for h in habits if h.get("active", True)]),
                "streaks": streaks,
                "completion_rate": overall_completion_rate,
                "most_consistent_habit": most_consistent,
                "needs_attention": needs_attention
            }
        except Exception as e:
            logger.error(f"Erreur lors du calcul des statistiques détaillées: {str(e)}")
            raise
    
    async def get_habits_needing_attention(self, user_id: str) -> List[Dict[str, Any]]:
        """Identifie les habitudes qui ont besoin d'attention"""
        try:
            stats = await self.get_detailed_habit_stats(user_id, "week")
            return stats["needs_attention"]
        except Exception as e:
            logger.error(f"Erreur lors de l'identification des habitudes à surveiller: {str(e)}")
            raise
    
    async def generate_weekly_report(
        self, 
        user_id: str, 
        weekly_stats: Dict[str, Any], 
        habits_needing_attention: List[Dict[str, Any]]
    ) -> str:
        """Génère un rapport hebdomadaire personnalisé avec l'IA"""
        try:
            # Préparer le contexte pour l'IA
            context = {
                "weekly_stats": weekly_stats,
                "habits_needing_attention": habits_needing_attention,
                "user_id": user_id
            }
            
            # Utiliser OpenAI pour générer le rapport
            response = self.openai_client.chat.completions.create(
                model=os.environ.get("MODEL_OPENAI", "gpt-3.5-turbo"),
                messages=[
                    {"role": "system", "content": """Tu es un coach en productivité qui analyse les habitudes d'un utilisateur.
                    Génère un rapport hebdomadaire personnalisé et motivant qui:
                    1. Résume les performances de la semaine
                    2. Met en avant les points forts
                    3. Suggère des améliorations pour les habitudes qui ont besoin d'attention
                    4. Propose des conseils pratiques pour la semaine suivante
                    
                    Utilise un ton encourageant et constructif."""},
                    {"role": "user", "content": f"Contexte: {context}"}
                ],
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Erreur lors de la génération du rapport hebdomadaire: {str(e)}")
            raise
    
    async def complete_habit(self, habit_id: int, user_id: str, notes: Optional[str] = None) -> Dict[str, Any]:
        """Marque une habitude comme complétée pour aujourd'hui"""
        try:
            # Vérifier si l'habitude existe
            habit = await supabase_service.get_habit_by_id(habit_id)
            if not habit:
                return None
            
            # Créer l'entrée de complétion
            completion = {
                "habit_id": habit_id,
                "user_id": user_id,
                "completion_date": datetime.now().isoformat(),
                "notes": notes
            }
            
            # Sauvegarder la complétion
            saved_completion = await supabase_service.add_habit_completion(completion)
            
            # Mettre à jour le streak
            streak = await self.calculate_habit_streak(habit_id, user_id)
            if streak:
                await supabase_service.update_habit(habit_id, {
                    "streak": streak["current_streak"],
                    "longest_streak": streak["longest_streak"],
                    "last_completion_date": streak["last_completion_date"]
                })
            
            return saved_completion
        except Exception as e:
            logger.error(f"Erreur lors de la complétion de l'habitude: {str(e)}")
            raise


# Instance du service
habits_service = HabitsService() 