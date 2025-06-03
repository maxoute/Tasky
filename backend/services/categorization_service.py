"""
Service pour la catégorisation automatique des tâches
"""
import logging
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from services.supabase_service import supabase_service

# Configuration du logging
logger = logging.getLogger(__name__)


class CategorizationService:
    """Service pour la catégorisation automatique des tâches"""
    
    @staticmethod
    async def get_categories() -> List[Dict[str, Any]]:
        """
        Récupère toutes les catégories prédéfinies
        
        Returns:
            Liste des catégories prédéfinies
        """
        try:
            response = await supabase_service.supabase.table('category_presets').select('*').order('name').execute()
            return response.data
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des catégories: {str(e)}")
            return []
    
    @staticmethod
    async def get_user_categorization_rules(user_id: str) -> List[Dict[str, Any]]:
        """
        Récupère les règles de catégorisation d'un utilisateur
        
        Args:
            user_id: ID de l'utilisateur
            
        Returns:
            Liste des règles de catégorisation
        """
        try:
            response = await supabase_service.supabase.table('auto_categorization_rules').select('*').eq('user_id', user_id).order('priority', ascending=False).execute()
            return response.data
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des règles de catégorisation: {str(e)}")
            return []
    
    @staticmethod
    async def add_categorization_rule(rule_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Ajoute une règle de catégorisation
        
        Args:
            rule_data: Données de la règle à ajouter
            
        Returns:
            Règle créée ou None en cas d'erreur
        """
        try:
            # Validation des données
            required_fields = ['user_id', 'keyword', 'category_id']
            for field in required_fields:
                if field not in rule_data:
                    logger.error(f"Champ requis manquant: {field}")
                    return None
            
            # Ajout de la règle
            response = await supabase_service.supabase.table('auto_categorization_rules').insert(rule_data).execute()
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
            await supabase_service.supabase.table('auto_categorization_rules').delete().eq('id', rule_id).execute()
            return True
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de la règle {rule_id}: {str(e)}")
            return False
    
    @staticmethod
    async def categorize_task(user_id: str, task_text: str, task_description: str = None) -> Dict[str, Any]:
        """
        Catégorise automatiquement une tâche
        
        Args:
            user_id: ID de l'utilisateur
            task_text: Texte de la tâche
            task_description: Description de la tâche (optionnelle)
            
        Returns:
            Dictionnaire contenant la catégorie, date de début, deadline et durée estimée
        """
        # Résultat par défaut
        result = {
            'category_id': None,
            'category_name': None,
            'start_date': datetime.now().date().isoformat(),
            'deadline': None,
            'estimated_time': None
        }
        
        try:
            # Combiner le texte et la description pour l'analyse
            full_text = (task_text or "") + " " + (task_description or "")
            full_text = full_text.lower()
            
            # 1. Analyser pour trouver des dates et durées
            result.update(CategorizationService._extract_time_info(full_text))
            
            # 2. Trouver la catégorie en fonction des règles de l'utilisateur
            rules = await CategorizationService.get_user_categorization_rules(user_id)
            
            for rule in rules:
                keyword = rule.get('keyword', '').lower()
                if keyword and keyword in full_text:
                    result['category_id'] = rule.get('category_id')
                    break
            
            # 3. Si aucune catégorie n'a été trouvée, essayer avec les catégories prédéfinies
            if not result['category_id']:
                categories = await CategorizationService.get_categories()
                for category in categories:
                    category_name = category.get('name', '').lower()
                    if category_name and category_name in full_text:
                        result['category_id'] = category.get('id')
                        result['category_name'] = category.get('name')
                        break
            
            # 4. Récupérer le nom de la catégorie si on a un ID mais pas de nom
            if result['category_id'] and not result['category_name']:
                categories = await CategorizationService.get_categories()
                for category in categories:
                    if category.get('id') == result['category_id']:
                        result['category_name'] = category.get('name')
                        break
            
            return result
        except Exception as e:
            logger.error(f"Erreur lors de la catégorisation automatique: {str(e)}")
            return result
    
    @staticmethod
    def _extract_time_info(text: str) -> Dict[str, Any]:
        """
        Extrait les informations de temps du texte
        
        Args:
            text: Texte à analyser
            
        Returns:
            Dictionnaire contenant start_date, deadline et estimated_time
        """
        result = {
            'start_date': datetime.now().date().isoformat(),
            'deadline': None,
            'estimated_time': None
        }
        
        today = datetime.now().date()
        
        # Recherche de dates
        date_patterns = [
            # Pour les dates explicites (DD/MM, DD/MM/YYYY, etc.)
            (r"(?:pour|avant|le|au|deadline[:\s]+)[\s]*((\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?)", 
                CategorizationService._parse_explicit_date),
            # Pour "demain"
            (r"\bdemain\b", lambda _: (today + timedelta(days=1)).isoformat()),
            # Pour "après-demain"
            (r"\baprès-demain\b|\bapres-demain\b", lambda _: (today + timedelta(days=2)).isoformat()),
            # Pour les jours de la semaine
            (r"\b(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b", 
                CategorizationService._parse_weekday),
            # Pour "dans X jours"
            (r"\bdans\s+(\d+)\s+jours?\b", lambda m: (today + timedelta(days=int(m.group(1)))).isoformat()),
            # Pour "cette semaine"
            (r"\bcette\s+semaine\b", lambda _: (today + timedelta(days=(6 - today.weekday()))).isoformat()),
            # Pour "la semaine prochaine"
            (r"\bla\s+semaine\s+prochaine\b|\bsemaine\s+prochaine\b", 
                lambda _: (today + timedelta(days=(7 - today.weekday() + 5))).isoformat()),
        ]
        
        # Recherche de deadline
        for pattern, handler in date_patterns:
            match = re.search(pattern, text)
            if match:
                result['deadline'] = handler(match)
                break
        
        # Recherche de durée estimée
        time_patterns = [
            # Pour les heures et minutes (1h, 2h30, 45min, etc.)
            (r"(?:pendant|durant|prend|durée[:\s]+)[\s]*(\d+)\s*h(?:eures?)?(?:\s*(\d+)\s*m(?:in(?:utes?)?)?)?", 
                lambda m: f"{m.group(1)}h{m.group(2) or ''}"),
            (r"(?:pendant|durant|prend|durée[:\s]+)[\s]*(\d+)\s*m(?:in(?:utes?)?)", 
                lambda m: f"{m.group(1)}min"),
        ]
        
        for pattern, handler in time_patterns:
            match = re.search(pattern, text)
            if match:
                result['estimated_time'] = handler(match)
                break
        
        return result
    
    @staticmethod
    def _parse_explicit_date(match) -> str:
        """Parse une date explicite et retourne au format YYYY-MM-DD"""
        day = int(match.group(2))
        month = int(match.group(3))
        year_str = match.group(4)
        
        # Si l'année n'est pas spécifiée, utiliser l'année courante
        today = datetime.now().date()
        if year_str:
            year = int(year_str)
            # Gérer les années abrégées (22 -> 2022)
            if year < 100:
                year += 2000
        else:
            year = today.year
            
            # Si le mois est déjà passé, utiliser l'année suivante
            if month < today.month or (month == today.month and day < today.day):
                year += 1
        
        try:
            return datetime(year, month, day).date().isoformat()
        except ValueError:
            # En cas de date invalide, retourner aujourd'hui
            return today.isoformat()
    
    @staticmethod
    def _parse_weekday(match) -> str:
        """Parse un jour de la semaine et retourne la date correspondante"""
        weekday_map = {
            'lundi': 0, 'mardi': 1, 'mercredi': 2, 'jeudi': 3,
            'vendredi': 4, 'samedi': 5, 'dimanche': 6
        }
        
        weekday = weekday_map.get(match.group(1).lower())
        today = datetime.now().date()
        days_ahead = weekday - today.weekday()
        
        # Si le jour est déjà passé cette semaine, aller à la semaine prochaine
        if days_ahead <= 0:
            days_ahead += 7
            
        target_date = today + timedelta(days=days_ahead)
        return target_date.isoformat()


# Créer une instance du service
categorization_service = CategorizationService() 