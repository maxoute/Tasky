"""
Routes FastAPI pour le service de recherche flexible
Inspiré de l'approche CrewAI BraveSearchTool
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import logging

from services.flexible_search_service import (
    FlexibleSearchService,
    SearchConfig,
    SearchProvider,
    Freshness,
    SafeSearch,
    VideoScriptGenerator,
    QuickSearch,
    TrendAnalyzer
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/search", tags=["flexible-search"])


class SearchRequest(BaseModel):
    """Requête de recherche basique"""
    query: str
    country: Optional[str] = "FR"
    language: Optional[str] = "fr"
    n_results: Optional[int] = 10


class AdvancedSearchRequest(BaseModel):
    """Requête de recherche avancée avec toutes les options"""
    query: str
    provider: Optional[str] = "brave"
    country: Optional[str] = "FR"
    language: Optional[str] = "fr"
    n_results: Optional[int] = 10
    freshness: Optional[str] = "pm"  # past_month
    safesearch: Optional[str] = "moderate"
    result_filter: Optional[str] = "web,news"
    save_file: Optional[bool] = False


class ScriptRequest(BaseModel):
    """Requête pour génération de script vidéo"""
    topic: str
    target_audience: Optional[str] = "débutants"
    style: Optional[str] = "orra_academy"
    include_research: Optional[bool] = True


@router.post("/quick")
async def quick_search(request: SearchRequest) -> Dict[str, Any]:
    """
    Recherche rapide avec paramètres minimaux
    Équivalent à l'usage simple de BraveSearchTool
    """
    try:
        if not request.query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Utiliser l'interface QuickSearch
        results = QuickSearch.search(
            query=request.query,
            n_results=request.n_results,
            country=request.country
        )
        
        return {
            "success": True,
            "query": request.query,
            "total_results": len(results),
            "results": results,
            "search_type": "quick"
        }
        
    except Exception as e:
        logger.error(f"Quick search error for '{request.query}': {e}")
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")


@router.post("/advanced")
async def advanced_search(request: AdvancedSearchRequest) -> Dict[str, Any]:
    """
    Recherche avancée avec configuration complète
    Permet de personnaliser tous les paramètres comme CrewAI
    """
    try:
        if not request.query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Créer la configuration personnalisée
        config = SearchConfig(
            provider=SearchProvider.BRAVE,
            country=request.country,
            language=request.language,
            n_results=request.n_results,
            freshness=Freshness(request.freshness),
            safesearch=SafeSearch(request.safesearch),
            result_filter=request.result_filter,
            save_file=request.save_file
        )
        
        # Effectuer la recherche
        service = FlexibleSearchService(config)
        results = service.search(request.query)
        
        if "error" in results:
            raise HTTPException(status_code=500, detail=results["error"])
        
        return {
            "success": True,
            "results": results,
            "search_type": "advanced"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid parameter: {str(e)}")
    except Exception as e:
        logger.error(f"Advanced search error for '{request.query}': {e}")
        raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")


@router.get("/trends/{topic}")
async def analyze_trends(
    topic: str,
    n_results: int = Query(20, description="Number of results per trend query")
) -> Dict[str, Any]:
    """
    Analyse les tendances pour un sujet donné
    """
    try:
        if not topic.strip():
            raise HTTPException(status_code=400, detail="Topic cannot be empty")
        
        # Créer le service et l'analyseur
        search_service = FlexibleSearchService()
        analyzer = TrendAnalyzer(search_service)
        
        # Analyser les tendances
        trends = analyzer.analyze_trends(topic)
        
        return {
            "success": True,
            "trends": trends,
            "search_type": "trend_analysis"
        }
        
    except Exception as e:
        logger.error(f"Trend analysis error for '{topic}': {e}")
        raise HTTPException(status_code=500, detail=f"Trend analysis error: {str(e)}")


@router.post("/generate-script")
async def generate_video_script(request: ScriptRequest) -> Dict[str, Any]:
    """
    Génère un script vidéo personnalisé en utilisant le service de recherche
    """
    try:
        if not request.topic.strip():
            raise HTTPException(status_code=400, detail="Topic cannot be empty")
        
        # Créer le service et le générateur
        search_service = FlexibleSearchService()
        script_generator = VideoScriptGenerator(search_service)
        
        # Générer le script
        script_data = script_generator.generate_script(
            topic=request.topic,
            target_audience=request.target_audience,
            style=request.style,
            include_research=request.include_research
        )
        
        return {
            "success": True,
            "script_data": script_data,
            "search_type": "script_generation"
        }
        
    except Exception as e:
        logger.error(f"Script generation error for '{request.topic}': {e}")
        raise HTTPException(status_code=500, detail=f"Script generation error: {str(e)}")


@router.get("/configs")
async def get_available_configs() -> Dict[str, Any]:
    """
    Retourne les configurations disponibles pour la recherche
    """
    return {
        "success": True,
        "configs": {
            "providers": [provider.value for provider in SearchProvider],
            "freshness_options": [fresh.value for fresh in Freshness],
            "safesearch_options": [safe.value for safe in SafeSearch],
            "default_config": {
                "provider": "brave",
                "country": "FR",
                "language": "fr",
                "n_results": 10,
                "freshness": "pm",
                "safesearch": "moderate",
                "result_filter": "web,news",
                "save_file": False
            }
        }
    }


@router.post("/batch")
async def batch_search(
    queries: List[str],
    config: Optional[AdvancedSearchRequest] = None
) -> Dict[str, Any]:
    """
    Effectue plusieurs recherches en batch avec la même configuration
    """
    try:
        if not queries:
            raise HTTPException(status_code=400, detail="At least one query required")
        
        if len(queries) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 queries allowed")
        
        # Configuration par défaut ou personnalisée
        search_config = SearchConfig()
        if config:
            search_config = SearchConfig(
                country=config.country,
                language=config.language,
                n_results=config.n_results,
                freshness=Freshness(config.freshness),
                safesearch=SafeSearch(config.safesearch),
                result_filter=config.result_filter,
                save_file=config.save_file
            )
        
        # Service de recherche
        service = FlexibleSearchService(search_config)
        
        # Effectuer toutes les recherches
        batch_results = []
        for query in queries:
            if query.strip():
                result = service.search(query.strip())
                batch_results.append({
                    "query": query,
                    "result": result
                })
        
        return {
            "success": True,
            "total_queries": len(batch_results),
            "batch_results": batch_results,
            "search_type": "batch"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid parameter: {str(e)}")
    except Exception as e:
        logger.error(f"Batch search error: {e}")
        raise HTTPException(status_code=500, detail=f"Batch search error: {str(e)}")


@router.get("/presets/{preset_name}")
async def use_search_preset(
    preset_name: str,
    query: str = Query(..., description="Search query")
) -> Dict[str, Any]:
    """
    Utilise des presets de configuration prédéfinis
    """
    try:
        if not query.strip():
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Presets prédéfinis
        presets = {
            "news": SearchConfig(
                freshness=Freshness.PAST_DAY,
                result_filter="news",
                n_results=10
            ),
            "tutorials": SearchConfig(
                freshness=Freshness.PAST_MONTH,
                result_filter="web",
                n_results=15
            ),
            "academic": SearchConfig(
                freshness=Freshness.PAST_YEAR,
                result_filter="web",
                n_results=20,
                save_file=True
            ),
            "international": SearchConfig(
                country="US",
                language="en",
                n_results=10
            ),
            "recent": SearchConfig(
                freshness=Freshness.PAST_WEEK,
                n_results=15
            )
        }
        
        if preset_name not in presets:
            available_presets = list(presets.keys())
            raise HTTPException(
                status_code=400, 
                detail=f"Preset '{preset_name}' not found. Available: {available_presets}"
            )
        
        # Utiliser le preset
        service = FlexibleSearchService(presets[preset_name])
        results = service.search(query)
        
        if "error" in results:
            raise HTTPException(status_code=500, detail=results["error"])
        
        return {
            "success": True,
            "preset_used": preset_name,
            "results": results,
            "search_type": "preset"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Preset search error for '{preset_name}': {e}")
        raise HTTPException(status_code=500, detail=f"Preset search error: {str(e)}")


@router.get("/health")
async def search_health_check() -> Dict[str, Any]:
    """
    Vérifie la santé du service de recherche
    """
    try:
        # Test simple avec QuickSearch
        test_results = QuickSearch.search("test", n_results=1)
        
        return {
            "service": "Flexible Search Service",
            "status": "healthy",
            "api_key_configured": bool(FlexibleSearchService().api_key),
            "test_search_successful": len(test_results) > 0 if test_results else False,
            "available_features": [
                "quick_search",
                "advanced_search", 
                "trend_analysis",
                "script_generation",
                "batch_search",
                "presets"
            ]
        }
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {
            "service": "Flexible Search Service",
            "status": "unhealthy",
            "error": str(e),
            "api_key_configured": False
        } 