"""
Service de recherche flexible inspiré de CrewAI BraveSearchTool
Permet des recherches configurables et modulaires
"""

import os
import requests
import json
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class SearchProvider(Enum):
    """Providers de recherche supportés"""
    BRAVE = "brave"
    # On peut ajouter d'autres providers plus tard (Google, Bing, etc.)


class Freshness(Enum):
    """Options de fraîcheur des résultats"""
    PAST_DAY = "pd"
    PAST_WEEK = "pw" 
    PAST_MONTH = "pm"
    PAST_YEAR = "py"
    ALL_TIME = ""


class SafeSearch(Enum):
    """Niveaux de SafeSearch"""
    OFF = "off"
    MODERATE = "moderate"
    STRICT = "strict"


@dataclass
class SearchConfig:
    """Configuration pour une recherche"""
    provider: SearchProvider = SearchProvider.BRAVE
    country: str = "FR"
    language: str = "fr"
    n_results: int = 10
    freshness: Freshness = Freshness.PAST_MONTH
    safesearch: SafeSearch = SafeSearch.MODERATE
    result_filter: str = "web,news"
    save_file: bool = False
    output_format: str = "json"  # json, markdown, text
    

@dataclass
class SearchResult:
    """Résultat de recherche standardisé"""
    title: str
    url: str
    description: str
    published: Optional[str] = None
    relevance_score: float = 0.0
    source: str = ""
    keywords: List[str] = None
    
    def __post_init__(self):
        if self.keywords is None:
            self.keywords = []


class FlexibleSearchService:
    """
    Service de recherche flexible et configurable
    Inspiré de l'approche CrewAI BraveSearchTool
    """
    
    def __init__(self, config: Optional[SearchConfig] = None):
        """
        Initialise le service avec une configuration par défaut
        
        Args:
            config: Configuration personnalisée (optionnelle)
        """
        self.config = config or SearchConfig()
        self.api_key = os.getenv('BRAVE_API_KEY')
        self.base_url = "https://api.search.brave.com/res/v1/web/search"
        
        if not self.api_key:
            logger.warning("BRAVE_API_KEY non trouvée dans les variables d'environnement")
    
    def search(self, 
               query: str, 
               config: Optional[SearchConfig] = None) -> Dict[str, Any]:
        """
        Effectue une recherche avec configuration flexible
        
        Args:
            query: Terme de recherche
            config: Configuration spécifique (override la config par défaut)
        
        Returns:
            Dict contenant les résultats formatés
        """
        search_config = config or self.config
        
        if not query.strip():
            return {"error": "Query cannot be empty"}
        
        if search_config.provider == SearchProvider.BRAVE:
            return self._brave_search(query, search_config)
        else:
            return {"error": f"Provider {search_config.provider} not supported"}
    
    def _brave_search(self, query: str, config: SearchConfig) -> Dict[str, Any]:
        """Recherche avec l'API Brave"""
        if not self.api_key:
            return {"error": "Brave API key missing"}
        
        params = {
            "q": query,
            "count": min(config.n_results, 20),
            "country": config.country,
            "search_lang": config.language,
            "safesearch": config.safesearch.value,
            "freshness": config.freshness.value,
            "result_filter": config.result_filter,
            "text_decorations": True,
            "spellcheck": True
        }
        
        headers = {
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": self.api_key
        }
        
        try:
            logger.info(f"Brave search: {query}")
            response = requests.get(self.base_url, params=params, headers=headers)
            response.raise_for_status()
            
            raw_results = response.json()
            formatted_results = self._format_results(raw_results, query, config)
            
            if config.save_file:
                self._save_results(formatted_results, query)
            
            return formatted_results
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Brave API error: {e}")
            return {"error": f"Request error: {str(e)}"}
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            return {"error": "Invalid API response"}
    
    def _format_results(self, raw_results: Dict, query: str, config: SearchConfig) -> Dict[str, Any]:
        """Formate les résultats dans un format standardisé"""
        if "web" not in raw_results:
            return {"error": "No web results found"}
        
        web_results = raw_results.get("web", {}).get("results", [])
        
        formatted_results = []
        for result in web_results:
            search_result = SearchResult(
                title=result.get("title", ""),
                url=result.get("url", ""),
                description=result.get("description", ""),
                published=result.get("age", ""),
                source="Brave Search",
                keywords=self._extract_keywords(result.get("title", "") + " " + result.get("description", ""))
            )
            formatted_results.append(search_result)
        
        return {
            "query": query,
            "total_results": len(formatted_results),
            "results": [result.__dict__ for result in formatted_results],
            "config_used": config.__dict__,
            "timestamp": datetime.now().isoformat(),
            "success": True
        }
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extrait des mots-clés du texte"""
        keywords = [
            "automatisation", "intelligence artificielle", "ia", "ai", "n8n", 
            "workflow", "api", "python", "formation", "tutoriel", "guide",
            "best practices", "optimisation", "productivité", "efficacité",
            "stratégie", "méthode", "technique", "outil", "plateforme", "make",
            "zapier", "integration", "no-code", "low-code"
        ]
        
        found_keywords = []
        text_lower = text.lower()
        
        for keyword in keywords:
            if keyword in text_lower:
                found_keywords.append(keyword)
        
        return found_keywords
    
    def _save_results(self, results: Dict, query: str) -> None:
        """Sauvegarde les résultats dans un fichier"""
        filename = f"search_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{query.replace(' ', '_')[:20]}.json"
        filepath = os.path.join("storage", filename)
        
        os.makedirs("storage", exist_ok=True)
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            logger.info(f"Results saved to {filepath}")
        except Exception as e:
            logger.error(f"Failed to save results: {e}")


class VideoScriptGenerator:
    """
    Générateur de scripts vidéo utilisant le service de recherche flexible
    """
    
    def __init__(self, search_service: FlexibleSearchService):
        self.search_service = search_service
    
    def generate_script(self, 
                       topic: str,
                       target_audience: str = "débutants",
                       style: str = "orra_academy",
                       include_research: bool = True) -> Dict[str, Any]:
        """
        Génère un script vidéo personnalisé
        
        Args:
            topic: Sujet de la vidéo
            target_audience: Public cible
            style: Style de présentation
            include_research: Inclure des recherches en ligne
        
        Returns:
            Dict contenant le script et les métadonnées
        """
        script_data = {
            "topic": topic,
            "target_audience": target_audience,
            "style": style,
            "script": "",
            "research_data": {},
            "generated_at": datetime.now().isoformat()
        }
        
        if include_research:
            # Configuration pour recherche de contenu vidéo
            research_config = SearchConfig(
                n_results=15,
                freshness=Freshness.PAST_MONTH,
                result_filter="web,news"
            )
            
            # Rechercher du contenu spécifique
            research_query = f"{topic} tutoriel guide 2024"
            research_results = self.search_service.search(research_query, research_config)
            
            if research_results.get("success"):
                script_data["research_data"] = research_results
        
        # Générer le script selon le style
        if style == "orra_academy":
            script_data["script"] = self._generate_orra_academy_script(
                topic, target_audience, script_data.get("research_data", {})
            )
        else:
            script_data["script"] = self._generate_generic_script(topic, target_audience)
        
        return script_data
    
    def _generate_orra_academy_script(self, topic: str, audience: str, research_data: Dict) -> str:
        """Génère un script dans le style Orra Academy"""
        
        # Extraire des insights de la recherche
        key_insights = []
        if research_data.get("results"):
            for result in research_data["results"][:5]:
                if result.get("keywords"):
                    key_insights.extend(result["keywords"])
        
        unique_insights = list(set(key_insights))[:10]
        
        script = f"""# Script pour "{topic}"

## Introduction (0-30s)
Salut tout le monde ! C'est Maxens, CTO de l'Orra Academy. 
Bienvenue sur notre chaîne ! Aujourd'hui, on plonge dans {topic.lower()}.

{self._add_hook_based_on_research(research_data)}

## Corps principal (30s-4min)
### 1. Les fondamentaux
- Pourquoi {topic.split()[0]} est devenu incontournable
- Les bases essentielles à maîtriser"""

        if unique_insights:
            script += f"\n- Focus sur : {', '.join(unique_insights[:3])}"

        script += f"""

### 2. Démonstration pratique
- Créons ensemble votre premier {topic.split()[0].lower()}
- Les erreurs que j'ai faites (pour que vous les évitiez !)
- Mon approche chez Orra Academy

### 3. Cas d'usage pour {audience}
{self._get_use_cases_for_audience(audience, topic)}

### 4. Conseils d'expert
- Les outils que j'utilise au quotidien
- Comment intégrer ça dans votre workflow
- Le piège #1 à éviter absolument

## Call to action (4-4:30min)
Si vous voulez maîtriser l'IA et les automatisations comme un pro, 
j'ai créé une formation complète sur Orra Academy.
Modules Python, N8N, stratégies IA... tout y est !

Lien en description : orra-academy.com
Et un petit like si ça vous a aidé ! 🚀

## Conclusion (4:30-5min)
Voilà les amis ! J'espère que ça vous donne envie de vous lancer.
Posez vos questions en commentaires, j'y réponds toujours.

À très bientôt pour un nouveau tuto !
Maxens 👋"""

        return script
    
    def _add_hook_based_on_research(self, research_data: Dict) -> str:
        """Ajoute un hook basé sur les recherches"""
        if not research_data.get("results"):
            return ""
        
        # Chercher des tendances ou actualités
        for result in research_data["results"][:3]:
            title = result.get("title", "").lower()
            if any(word in title for word in ["2024", "nouveau", "révolution", "innovation"]):
                return f"Et avec les dernières évolutions en 2024, c'est LE moment de s'y mettre !"
        
        return "Et croyez-moi, après 3 ans à former plus de 10 000 étudiants, je sais exactement par où commencer !"
    
    def _get_use_cases_for_audience(self, audience: str, topic: str) -> str:
        """Génère des cas d'usage selon l'audience"""
        if audience == "débutants":
            return """- Automatiser vos tâches répétitives
- Connecter vos outils préférés
- Gagner 2h par jour (minimum !)"""
        elif audience == "intermédiaires":
            return """- Workflows complexes avec conditions
- Intégrations API avancées
- Optimisation des performances"""
        else:
            return """- Architecture scalable
- Gestion d'erreurs robuste
- Monitoring et analytics"""
    
    def _generate_generic_script(self, topic: str, audience: str) -> str:
        """Génère un script générique"""
        return f"""# Script générique pour "{topic}"

## Introduction
Présentation du sujet {topic}

## Développement
Points principaux sur {topic} pour {audience}

## Conclusion
Récapitulatif et call to action"""


# Classes utilitaires pour différents use cases
class QuickSearch:
    """Interface simplifiée pour des recherches rapides"""
    
    @staticmethod
    def search(query: str, n_results: int = 10, country: str = "FR") -> List[Dict]:
        """Recherche rapide avec paramètres minimaux"""
        config = SearchConfig(n_results=n_results, country=country)
        service = FlexibleSearchService(config)
        results = service.search(query)
        
        if results.get("success"):
            return results.get("results", [])
        return []


class TrendAnalyzer:
    """Analyseur de tendances utilisant le service de recherche"""
    
    def __init__(self, search_service: FlexibleSearchService):
        self.search_service = search_service
    
    def analyze_trends(self, topic: str) -> Dict[str, Any]:
        """Analyse les tendances pour un sujet donné"""
        trend_config = SearchConfig(
            freshness=Freshness.PAST_WEEK,
            n_results=20
        )
        
        queries = [
            f"{topic} tendances 2024",
            f"{topic} nouveautés",
            f"{topic} innovation"
        ]
        
        all_trends = []
        for query in queries:
            results = self.search_service.search(query, trend_config)
            if results.get("success"):
                all_trends.extend(results.get("results", []))
        
        return {
            "topic": topic,
            "trends_found": len(all_trends),
            "latest_trends": all_trends[:10],
            "analyzed_at": datetime.now().isoformat()
        }


# Instances par défaut
default_search_service = FlexibleSearchService()
quick_search = QuickSearch() 