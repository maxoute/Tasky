"""
Service de catégorisation automatique des tâches
"""
import logging
import re
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Tuple, List

from services.supabase_service import supabase_service

# Configuration du logging
logger = logging.getLogger(__name__)


class TaskCategorizationService:
    """Service pour catégoriser automatiquement les tâches et extraire des métadonnées"""
    
    # Expressions régulières pour extraire les métadonnées
    DATE_PATTERNS = [
        # Date explicite (e.g., "pour le 25/12/2023")
        r"pour le (\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)",
        r"le (\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)",
        r"deadline[:\s]+(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?)",
        
        # Jours de la semaine (e.g., "lundi prochain", "ce vendredi")
        r"(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)(?:\s+prochain)?",
        r"ce\s+(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)",
        
        # Expressions relatives (e.g., "demain", "dans 3 jours")
        r"(aujourd'hui|demain|après-demain)",
        r"dans\s+(\d+)\s+jour(?:s)?",
        r"dans\s+(\d+)\s+semaine(?:s)?",
    ]
    
    DURATION_PATTERNS = [
        # Durée explicite (e.g., "pendant 2 heures", "prend 30 minutes")
        r"pendant\s+(\d+)\s+(minute|minutes|min|heure|heures|h)",
        r"prend\s+(\d+)\s+(minute|minutes|min|heure|heures|h)",
        r"durée[:\s]+(\d+)\s+(minute|minutes|min|heure|heures|h)",
        r"(\d+)\s+(minute|minutes|min|heure|heures|h)",
    ]
    
    # Catégories prédéfinies avec des mots-clés associés
    DEFAULT_CATEGORIES = {
        "Travail": ["travail", "boulot", "projet", "réunion", "client", "rapport", "présentation", "deadline"],
        "Personnel": ["personnel", "maison", "famille", "santé", "médecin", "rendez-vous", "courses"],
        "Apprentissage": ["apprendre", "étudier", "cours", "formation", "tutoriel", "livre", "lecture"],
        "Loisirs": ["loisir", "sport", "film", "série", "jeu", "sortie", "ami", "restaurant"],
        "Finance": ["banque", "paiement", "facture", "impôt", "budget", "économie", "investissement"],
        "Santé": ["médecin", "sport", "exercice", "nutrition", "vitamines", "médicament", "santé"]
    }
    
    @staticmethod
    async def get_user_categories(user_id: str) -> List[Dict[str, Any]]:
        """
        Récupère les catégories disponibles pour un utilisateur
        
        Args:
            user_id: ID de l'utilisateur
            
        Returns:
            Liste des catégories
        """
        try:
            response = await supabase_service.supabase.table('categories').select('*').eq('user_id', user_id).execute()
            return response.data
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des catégories: {str(e)}")
            return []
    
    @staticmethod
    async def get_user_categorization_rules(user_id: str) -> List[Dict[str, Any]]:
        """
        Récupère les règles de catégorisation définies par l'utilisateur
        
        Args:
            user_id: ID de l'utilisateur
            
        Returns:
            Liste des règles de catégorisation
        """
        try:
            response = await supabase_service.supabase.table('categorization_rules').select('*').eq('user_id', user_id).execute()
            return response.data
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des règles de catégorisation: {str(e)}")
            return []
    
    @staticmethod
    async def add_categorization_rule(rule_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Ajoute une nouvelle règle de catégorisation
        
        Args:
            rule_data: Données de la règle (user_id, category_id, keywords, priority)
            
        Returns:
            Règle créée ou None en cas d'erreur
        """
        try:
            # Validation des données
            required_fields = ['user_id', 'category_id', 'keywords']
            for field in required_fields:
                if field not in rule_data:
                    logger.error(f"Champ requis manquant: {field}")
                    return None
            
            # Ajouter une priorité par défaut si non spécifiée
            if 'priority' not in rule_data:
                rule_data['priority'] = 1
            
            response = await supabase_service.supabase.table('categorization_rules').insert(rule_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erreur lors de l'ajout d'une règle de catégorisation: {str(e)}")
            return None
    
    @staticmethod
    async def delete_categorization_rule(rule_id: int) -> bool:
        """
        Supprime une règle de catégorisation
        
        Args:
            rule_id: ID de la règle à supprimer
            
        Returns:
            True si la suppression a réussi, False sinon
        """
        try:
            await supabase_service.supabase.table('categorization_rules').delete().eq('id', rule_id).execute()
            return True
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de la règle {rule_id}: {str(e)}")
            return False
    
    @staticmethod
    async def categorize_task(user_id: str, task_description: str) -> Dict[str, Any]:
        """
        Analyse une description de tâche et extrait les métadonnées pertinentes
        
        Args:
            user_id: ID de l'utilisateur
            task_description: Description de la tâche
            
        Returns:
            Dictionnaire contenant la catégorie, la date d'échéance et la durée estimée
        """
        try:
            # Convertir en minuscules pour faciliter la recherche
            description_lower = task_description.lower()
            
            # Initialiser les résultats
            result = {
                'category_id': None,
                'category_name': None,
                'due_date': None,
                'start_date': None,
                'estimated_duration': None
            }
            
            # 1. Extraire la date
            due_date = TaskCategorizationService._extract_date(description_lower)
            if due_date:
                result['due_date'] = due_date
                
                # Par défaut, la date de début est aujourd'hui
                result['start_date'] = datetime.now().date().isoformat()
            
            # 2. Extraire la durée
            duration_minutes = TaskCategorizationService._extract_duration(description_lower)
            if duration_minutes:
                result['estimated_duration'] = duration_minutes
            
            # 3. Déterminer la catégorie
            category = await TaskCategorizationService._determine_category(user_id, description_lower)
            if category:
                result['category_id'] = category['id']
                result['category_name'] = category['name']
            
            return result
        except Exception as e:
            logger.error(f"Erreur lors de la catégorisation de la tâche: {str(e)}")
            return {
                'category_id': None,
                'category_name': None,
                'due_date': None,
                'start_date': None,
                'estimated_duration': None
            }
    
    @staticmethod
    def _extract_date(text: str) -> Optional[str]:
        """
        Extrait la date d'une description de tâche
        
        Args:
            text: Description de la tâche en minuscules
            
        Returns:
            Date au format YYYY-MM-DD ou None si aucune date trouvée
        """
        today = datetime.now().date()
        
        # 1. Rechercher les dates explicites (JJ/MM/AAAA)
        for pattern in TaskCategorizationService.DATE_PATTERNS[:3]:
            match = re.search(pattern, text)
            if match:
                date_str = match.group(1)
                try:
                    # Gérer différents formats de date (JJ/MM/AAAA, JJ-MM-AAAA, JJ/MM, JJ-MM)
                    if '/' in date_str:
                        parts = date_str.split('/')
                    else:
                        parts = date_str.split('-')
                    
                    day = int(parts[0])
                    month = int(parts[1])
                    year = int(parts[2]) if len(parts) > 2 else today.year
                    
                    # Ajuster l'année si seulement 2 chiffres
                    if year < 100:
                        year += 2000
                    
                    # Créer la date
                    due_date = datetime(year, month, day).date()
                    
                    # Si la date est dans le passé, ajouter un an
                    if due_date < today:
                        due_date = datetime(year + 1, month, day).date()
                    
                    return due_date.isoformat()
                except (ValueError, IndexError):
                    continue
        
        # 2. Rechercher les jours de la semaine
        weekdays = {
            'lundi': 0, 'mardi': 1, 'mercredi': 2, 'jeudi': 3, 
            'vendredi': 4, 'samedi': 5, 'dimanche': 6
        }
        
        for pattern in TaskCategorizationService.DATE_PATTERNS[3:5]:
            match = re.search(pattern, text)
            if match:
                weekday_name = match.group(1)
                target_weekday = weekdays.get(weekday_name)
                
                if target_weekday is not None:
                    # Calculer le nombre de jours jusqu'au prochain jour de la semaine spécifié
                    days_ahead = (target_weekday - today.weekday()) % 7
                    
                    # Si "prochain" est spécifié et c'est le même jour, ajouter 7 jours
                    if days_ahead == 0 and 'prochain' in text:
                        days_ahead = 7
                    
                    due_date = today + timedelta(days=days_ahead)
                    return due_date.isoformat()
        
        # 3. Rechercher les expressions relatives (aujourd'hui, demain, etc.)
        relative_days = {
            'aujourd\'hui': 0,
            'demain': 1,
            'après-demain': 2
        }
        
        match = re.search(TaskCategorizationService.DATE_PATTERNS[5], text)
        if match:
            day_name = match.group(1)
            days_ahead = relative_days.get(day_name, 0)
            due_date = today + timedelta(days=days_ahead)
            return due_date.isoformat()
        
        # 4. Rechercher "dans X jours/semaines"
        match = re.search(TaskCategorizationService.DATE_PATTERNS[6], text)
        if match:
            days = int(match.group(1))
            due_date = today + timedelta(days=days)
            return due_date.isoformat()
        
        match = re.search(TaskCategorizationService.DATE_PATTERNS[7], text)
        if match:
            weeks = int(match.group(1))
            due_date = today + timedelta(weeks=weeks)
            return due_date.isoformat()
        
        return None
    
    @staticmethod
    def _extract_duration(text: str) -> Optional[int]:
        """
        Extrait la durée estimée d'une tâche en minutes
        
        Args:
            text: Description de la tâche en minuscules
            
        Returns:
            Durée en minutes ou None si aucune durée trouvée
        """
        for pattern in TaskCategorizationService.DURATION_PATTERNS:
            match = re.search(pattern, text)
            if match:
                value = int(match.group(1))
                unit = match.group(2)
                
                # Convertir en minutes
                if unit in ['heure', 'heures', 'h']:
                    return value * 60
                else:
                    return value
        
        return None
    
    @staticmethod
    async def _determine_category(user_id: str, text: str) -> Optional[Dict[str, Any]]:
        """
        Détermine la catégorie la plus appropriée pour une description de tâche
        
        Args:
            user_id: ID de l'utilisateur
            text: Description de la tâche en minuscules
            
        Returns:
            Dictionnaire contenant l'ID et le nom de la catégorie, ou None
        """
        # 1. Récupérer les catégories et règles de l'utilisateur
        categories = await TaskCategorizationService.get_user_categories(user_id)
        rules = await TaskCategorizationService.get_user_categorization_rules(user_id)
        
        # Créer un dictionnaire des catégories par ID
        categories_by_id = {cat['id']: cat for cat in categories}
        
        # 2. Trier les règles par priorité (descendante)
        rules.sort(key=lambda r: r.get('priority', 1), reverse=True)
        
        # 3. Vérifier chaque règle dans l'ordre de priorité
        for rule in rules:
            keywords = rule.get('keywords', '').lower().split(',')
            for keyword in keywords:
                keyword = keyword.strip()
                if keyword and keyword in text:
                    category_id = rule['category_id']
                    if category_id in categories_by_id:
                        return {
                            'id': category_id,
                            'name': categories_by_id[category_id]['name']
                        }
        
        # 4. Si aucune règle personnalisée ne correspond, utiliser les catégories par défaut
        best_category = None
        max_matches = 0
        
        for category in categories:
            # Chercher le nom de la catégorie dans les catégories par défaut
            category_name = category['name']
            keywords = TaskCategorizationService.DEFAULT_CATEGORIES.get(category_name, [])
            
            matches = sum(1 for keyword in keywords if keyword in text)
            if matches > max_matches:
                max_matches = matches
                best_category = category
        
        # Retourner la meilleure correspondance si au moins un mot-clé correspond
        if max_matches > 0 and best_category:
            return {
                'id': best_category['id'],
                'name': best_category['name']
            }
        
        # 5. Si toujours rien, retourner la première catégorie (par défaut)
        return categories[0] if categories else None


# Créer une instance du service
task_categorization_service = TaskCategorizationService() 