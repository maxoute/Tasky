"""
Service de gestion des habitudes utilisateur
"""
import logging
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from calendar import monthrange
import os

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
    """Service pour gérer les habitudes utilisateur et leur suivi"""
    
    @staticmethod
    async def get_user_habits(user_id: str) -> List[Dict[str, Any]]:
        """
        Récupère toutes les habitudes d'un utilisateur
        
        Args:
            user_id: ID de l'utilisateur
            
        Returns:
            Liste des habitudes
        """
        try:
            if not supabase:
                logger.warning("Supabase n'est pas configuré. Impossible de récupérer les habitudes.")
                return []
                
            response = supabase.table('habits').select('*').eq('user_id', user_id).execute()
            return response.data
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des habitudes: {str(e)}")
            return []
    
    @staticmethod
    async def add_habit(habit_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Ajoute une nouvelle habitude
        
        Args:
            habit_data: Données de l'habitude à créer avec les champs:
                        - user_id (obligatoire): ID de l'utilisateur
                        - name (obligatoire): Nom de l'habitude
                        - description (optionnel): Description détaillée
                        - frequency (obligatoire): 'daily', 'weekly', ou une liste de jours
                        - target_value (optionnel): Valeur cible (par défaut: 1)
                        - unit (optionnel): Unité de mesure (par défaut: 'fois')
                        - category (optionnel): Catégorie de l'habitude
                        - color (optionnel): Couleur pour l'affichage (par défaut: '#000000')
                        - reminder_time (optionnel): Heure de rappel (format HH:MM)
            
        Returns:
            Habitude créée ou None en cas d'erreur
        """
        try:
            if not supabase:
                logger.warning("Supabase n'est pas configuré. Impossible d'ajouter une habitude.")
                return None
                
            # Validation des champs obligatoires
            required_fields = ['user_id', 'name', 'frequency']
            for field in required_fields:
                if field not in habit_data:
                    logger.error(f"Champ obligatoire manquant: {field}")
                    return None
            
            # Valeurs par défaut pour les champs optionnels
            if 'description' not in habit_data:
                habit_data['description'] = ''
            
            if 'target_value' not in habit_data:
                habit_data['target_value'] = 1
            
            if 'unit' not in habit_data:
                habit_data['unit'] = 'fois'
            
            if 'color' not in habit_data:
                habit_data['color'] = '#000000'
            
            # Valider et nettoyer la fréquence
            frequency = habit_data['frequency']
            if isinstance(frequency, list):
                # Convertir la liste en JSON
                habit_data['frequency'] = json.dumps(frequency)
            elif frequency not in ['daily', 'weekly']:
                logger.error(f"Fréquence invalide: {frequency}")
                return None
            
            # Ajouter la date de création
            habit_data['created_at'] = datetime.now().isoformat()
            
            # Insérer dans la base de données
            response = supabase.table('habits').insert(habit_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erreur lors de l'ajout d'une habitude: {str(e)}")
            return None
    
    @staticmethod
    async def update_habit(habit_id: int, habit_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Met à jour une habitude existante
        
        Args:
            habit_id: ID de l'habitude à mettre à jour
            habit_data: Données à mettre à jour
            
        Returns:
            Habitude mise à jour ou None en cas d'erreur
        """
        try:
            if not supabase:
                logger.warning("Supabase n'est pas configuré. Impossible de mettre à jour l'habitude.")
                return None
                
            # Valider et nettoyer la fréquence si présente
            if 'frequency' in habit_data and isinstance(habit_data['frequency'], list):
                habit_data['frequency'] = json.dumps(habit_data['frequency'])
            
            # Mettre à jour dans la base de données
            response = supabase.table('habits').update(habit_data).eq('id', habit_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour de l'habitude {habit_id}: {str(e)}")
            return None
    
    @staticmethod
    async def delete_habit(habit_id: int) -> bool:
        """
        Supprime une habitude et ses entrées associées
        
        Args:
            habit_id: ID de l'habitude à supprimer
            
        Returns:
            True si la suppression a réussi, False sinon
        """
        try:
            if not supabase:
                logger.warning("Supabase n'est pas configuré. Impossible de supprimer l'habitude.")
                return False
                
            # Supprimer d'abord les entrées associées
            supabase.table('habit_entries').delete().eq('habit_id', habit_id).execute()
            
            # Puis supprimer l'habitude
            response = supabase.table('habits').delete().eq('id', habit_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de l'habitude {habit_id}: {str(e)}")
            return False
    
    @staticmethod
    async def get_habit_entries(habit_id: int, start_date: str = None, end_date: str = None) -> List[Dict[str, Any]]:
        """
        Récupère les entrées d'une habitude sur une période donnée
        
        Args:
            habit_id: ID de l'habitude
            start_date: Date de début (format YYYY-MM-DD, optionnel)
            end_date: Date de fin (format YYYY-MM-DD, optionnel)
            
        Returns:
            Liste des entrées pour l'habitude
        """
        try:
            if not supabase:
                logger.warning("Supabase n'est pas configuré. Impossible de récupérer les entrées d'habitude.")
                return []
                
            query = supabase.table('habit_entries').select('*').eq('habit_id', habit_id)
            
            if start_date:
                query = query.gte('date', start_date)
            
            if end_date:
                query = query.lte('date', end_date)
            
            response = query.order('date').execute()
            return response.data
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des entrées pour l'habitude {habit_id}: {str(e)}")
            return []
    
    @staticmethod
    async def add_habit_entry(entry_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Ajoute ou met à jour une entrée pour une habitude à une date donnée
        
        Args:
            entry_data: Données de l'entrée avec les champs:
                        - habit_id (obligatoire): ID de l'habitude
                        - date (obligatoire): Date de l'entrée (format YYYY-MM-DD)
                        - value (obligatoire): Valeur réalisée
                        - notes (optionnel): Notes ou commentaires
            
        Returns:
            Entrée créée/mise à jour ou None en cas d'erreur
        """
        try:
            if not supabase:
                logger.warning("Supabase n'est pas configuré. Impossible d'ajouter une entrée d'habitude.")
                return None
                
            # Validation des champs obligatoires
            required_fields = ['habit_id', 'date', 'value']
            for field in required_fields:
                if field not in entry_data:
                    logger.error(f"Champ obligatoire manquant: {field}")
                    return None
            
            # Vérifier si une entrée existe déjà pour cette habitude à cette date
            response = supabase.table('habit_entries').select('*') \
                .eq('habit_id', entry_data['habit_id']) \
                .eq('date', entry_data['date']) \
                .execute()
            
            if response.data:
                # Mettre à jour l'entrée existante
                entry_id = response.data[0]['id']
                response = supabase.table('habit_entries').update(entry_data) \
                    .eq('id', entry_id) \
                    .execute()
            else:
                # Créer une nouvelle entrée
                response = supabase.table('habit_entries').insert(entry_data).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erreur lors de l'ajout d'une entrée pour l'habitude: {str(e)}")
            return None
    
    @staticmethod
    async def delete_habit_entry(entry_id: int) -> bool:
        """
        Supprime une entrée d'habitude
        
        Args:
            entry_id: ID de l'entrée à supprimer
            
        Returns:
            True si la suppression a réussi, False sinon
        """
        try:
            if not supabase:
                logger.warning("Supabase n'est pas configuré. Impossible de supprimer l'entrée d'habitude.")
                return False
                
            response = supabase.table('habit_entries').delete().eq('id', entry_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de l'entrée {entry_id}: {str(e)}")
            return False
    
    @staticmethod
    async def get_habit_stats(user_id: str, habit_id: int = None, period: str = 'month') -> Dict[str, Any]:
        """
        Calcule des statistiques pour les habitudes d'un utilisateur
        
        Args:
            user_id: ID de l'utilisateur
            habit_id: ID d'une habitude spécifique (optionnel)
            period: Période pour les statistiques ('week', 'month', 'year')
            
        Returns:
            Dictionnaire contenant les statistiques
        """
        try:
            if not supabase:
                logger.warning("Supabase n'est pas configuré. Impossible de calculer les statistiques des habitudes.")
                return {
                    'period_start': None,
                    'period_end': None,
                    'period_type': period,
                    'habits': [],
                    'overall_completion_rate': 0
                }
                
            today = datetime.now().date()
            
            # Déterminer les dates de début et de fin selon la période
            if period == 'week':
                # Du lundi au dimanche de la semaine en cours
                start_date = today - timedelta(days=today.weekday())
                end_date = start_date + timedelta(days=6)
            elif period == 'month':
                # Du premier jour au dernier jour du mois en cours
                start_date = today.replace(day=1)
                last_day = monthrange(today.year, today.month)[1]
                end_date = today.replace(day=last_day)
            elif period == 'year':
                # Du premier jour au dernier jour de l'année en cours
                start_date = today.replace(month=1, day=1)
                end_date = today.replace(month=12, day=31)
            else:
                # Par défaut, le mois en cours
                start_date = today.replace(day=1)
                last_day = monthrange(today.year, today.month)[1]
                end_date = today.replace(day=last_day)
            
            # Convertir les dates en chaînes
            start_date_str = start_date.isoformat()
            end_date_str = end_date.isoformat()
            
            # Récupérer les habitudes
            if habit_id:
                # Pour une habitude spécifique
                response = supabase.table('habits') \
                    .select('*') \
                    .eq('id', habit_id) \
                    .execute()
                habits = response.data
            else:
                # Pour toutes les habitudes de l'utilisateur
                response = supabase.table('habits') \
                    .select('*') \
                    .eq('user_id', user_id) \
                    .execute()
                habits = response.data
            
            # Calculer les statistiques pour chaque habitude
            stats = {
                'period_start': start_date_str,
                'period_end': end_date_str,
                'period_type': period,
                'habits': []
            }
            
            for habit in habits:
                # Récupérer les entrées pour cette habitude dans la période
                entries = await HabitsService.get_habit_entries(
                    habit['id'], 
                    start_date=start_date_str, 
                    end_date=end_date_str
                )
                
                # Nombre de jours dans la période
                delta = (end_date - start_date).days + 1
                
                # Nombre de jours actifs requis selon la fréquence
                frequency = habit['frequency']
                if isinstance(frequency, str) and not (frequency.startswith('[') and frequency.endswith(']')):
                    if frequency == 'daily':
                        days_required = delta
                    elif frequency == 'weekly':
                        days_required = (delta + 6) // 7  # Arrondi au supérieur
                    else:
                        days_required = delta
                else:
                    # Si c'est une liste de jours (JSON), calculer combien de ces jours sont dans la période
                    try:
                        if isinstance(frequency, str):
                            days_list = json.loads(frequency)
                        else:
                            days_list = frequency
                        
                        # Compter les jours de la semaine correspondants dans la période
                        days_required = 0
                        current_date = start_date
                        while current_date <= end_date:
                            if current_date.strftime('%A').lower() in days_list:
                                days_required += 1
                            current_date += timedelta(days=1)
                    except json.JSONDecodeError:
                        # En cas d'erreur, considérer comme quotidien
                        days_required = delta
                
                # Calculer les entrées réussies (valeur >= valeur cible)
                days_completed = sum(1 for entry in entries if entry['value'] >= habit['target_value'])
                
                # Taux de réussite
                completion_rate = (days_completed / days_required) * 100 if days_required > 0 else 0
                
                # Séquence actuelle
                current_streak = 0
                latest_entries = sorted(entries, key=lambda e: e['date'], reverse=True)
                
                for i in range(min(len(latest_entries), 30)):  # Limiter à 30 jours en arrière
                    entry_date = datetime.fromisoformat(latest_entries[i]['date']).date()
                    expected_date = today - timedelta(days=i)
                    
                    # Vérifier si cette date correspond à la fréquence
                    date_matches_frequency = True
                    if isinstance(frequency, str) and not (frequency.startswith('[') and frequency.endswith(']')):
                        if frequency == 'weekly':
                            # Pour hebdomadaire, chercher le jour le plus récent de la semaine
                            date_matches_frequency = (
                                entry_date.isocalendar()[1] == expected_date.isocalendar()[1] and
                                entry_date.isocalendar()[0] == expected_date.isocalendar()[0]
                            )
                    else:
                        try:
                            if isinstance(frequency, str):
                                days_list = json.loads(frequency)
                            else:
                                days_list = frequency
                            date_matches_frequency = entry_date.strftime('%A').lower() in days_list
                        except json.JSONDecodeError:
                            date_matches_frequency = True
                    
                    if (
                        entry_date == expected_date and
                        latest_entries[i]['value'] >= habit['target_value'] and
                        date_matches_frequency
                    ):
                        current_streak += 1
                    else:
                        break
                
                # Ajouter les statistiques de cette habitude
                habit_stats = {
                    'habit_id': habit['id'],
                    'name': habit['name'],
                    'days_completed': days_completed,
                    'days_required': days_required,
                    'completion_rate': round(completion_rate, 2),
                    'current_streak': current_streak,
                    'entries': entries
                }
                
                stats['habits'].append(habit_stats)
            
            # Calculer les statistiques globales
            total_completion = sum(h['completion_rate'] for h in stats['habits']) / len(stats['habits']) if stats['habits'] else 0
            stats['overall_completion_rate'] = round(total_completion, 2)
            
            return stats
        except Exception as e:
            logger.error(f"Erreur lors du calcul des statistiques pour l'utilisateur {user_id}: {str(e)}")
            return {
                'period_start': None,
                'period_end': None,
                'period_type': period,
                'habits': [],
                'overall_completion_rate': 0
            }


# Créer une instance du service
habits_service = HabitsService() 