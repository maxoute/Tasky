#!/usr/bin/env python3
"""
Démonstration du service de recherche flexible
Montre différents use cases et configurations
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

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

def demo_basic_search():
    """Démo de recherche de base"""
    print("🔍 RECHERCHE DE BASE")
    print("=" * 40)
    
    # Configuration simple
    service = FlexibleSearchService()
    results = service.search("N8N automation tutorial")
    
    if results.get("success"):
        print(f"✅ Trouvé {results['total_results']} résultats")
        for i, result in enumerate(results['results'][:3], 1):
            print(f"{i}. {result['title']}")
            print(f"   URL: {result['url']}")
            print(f"   Mots-clés: {result['keywords']}")
            print()
    else:
        print(f"❌ Erreur: {results.get('error')}")

def demo_custom_config():
    """Démo avec configuration personnalisée"""
    print("⚙️ RECHERCHE AVEC CONFIG PERSONNALISÉE")
    print("=" * 40)
    
    # Configuration avancée
    custom_config = SearchConfig(
        provider=SearchProvider.BRAVE,
        country="US",
        language="en",
        n_results=5,
        freshness=Freshness.PAST_WEEK,
        safesearch=SafeSearch.MODERATE,
        save_file=True
    )
    
    service = FlexibleSearchService(custom_config)
    results = service.search("Make.com vs Zapier 2024")
    
    if results.get("success"):
        print(f"✅ Config: {results['config_used']['country']}, {results['config_used']['language']}")
        print(f"✅ Résultats: {results['total_results']}")
        print(f"✅ Fichier sauvegardé: {results['config_used']['save_file']}")
    else:
        print(f"❌ Erreur: {results.get('error')}")

def demo_quick_search():
    """Démo de recherche rapide"""
    print("⚡ RECHERCHE RAPIDE")
    print("=" * 40)
    
    # Interface simplifiée
    results = QuickSearch.search("Python automation", n_results=3)
    
    print(f"✅ {len(results)} résultats trouvés rapidement")
    for result in results:
        print(f"- {result['title']}")

def demo_trend_analysis():
    """Démo d'analyse de tendances"""
    print("📈 ANALYSE DE TENDANCES")
    print("=" * 40)
    
    service = FlexibleSearchService()
    analyzer = TrendAnalyzer(service)
    
    trends = analyzer.analyze_trends("IA")
    
    print(f"✅ {trends['trends_found']} tendances analysées pour: {trends['topic']}")
    print("Top 3 tendances:")
    for i, trend in enumerate(trends['latest_trends'][:3], 1):
        print(f"{i}. {trend['title']}")

def demo_script_generation():
    """Démo de génération de script"""
    print("🎬 GÉNÉRATION DE SCRIPT VIDÉO")
    print("=" * 40)
    
    # Service de recherche
    search_service = FlexibleSearchService()
    
    # Générateur de script
    script_gen = VideoScriptGenerator(search_service)
    
    # Générer script style Orra Academy
    script_data = script_gen.generate_script(
        topic="MAKE pour les débutants",
        target_audience="débutants",
        style="orra_academy",
        include_research=True
    )
    
    print(f"✅ Script généré pour: {script_data['topic']}")
    print(f"✅ Audience: {script_data['target_audience']}")
    print(f"✅ Style: {script_data['style']}")
    print("\n📝 APERÇU DU SCRIPT:")
    print(script_data['script'][:500] + "...")

def demo_multiple_configs():
    """Démo avec différentes configurations pour différents besoins"""
    print("🎯 CONFIGS MULTIPLES POUR DIFFÉRENTS BESOINS")
    print("=" * 50)
    
    # Config pour recherche d'actualités
    news_config = SearchConfig(
        freshness=Freshness.PAST_DAY,
        result_filter="news",
        n_results=5
    )
    
    # Config pour recherche de tutoriels
    tutorial_config = SearchConfig(
        freshness=Freshness.PAST_MONTH,
        result_filter="web",
        n_results=10
    )
    
    # Config pour recherche académique
    academic_config = SearchConfig(
        freshness=Freshness.PAST_YEAR,
        result_filter="web",
        n_results=15,
        save_file=True
    )
    
    service = FlexibleSearchService()
    
    print("📰 Actualités (dernières 24h):")
    news_results = service.search("IA intelligence artificielle", news_config)
    if news_results.get("success"):
        print(f"   {news_results['total_results']} actualités trouvées")
    
    print("\n📚 Tutoriels (dernier mois):")
    tutorial_results = service.search("Python automation tutorial", tutorial_config)
    if tutorial_results.get("success"):
        print(f"   {tutorial_results['total_results']} tutoriels trouvés")
    
    print("\n🎓 Recherche académique (dernière année):")
    academic_results = service.search("machine learning research", academic_config)
    if academic_results.get("success"):
        print(f"   {academic_results['total_results']} articles trouvés")
        print(f"   Résultats sauvegardés: {academic_results['config_used']['save_file']}")

def show_use_cases():
    """Montre différents cas d'usage"""
    print("🎯 CAS D'USAGE DU SERVICE FLEXIBLE")
    print("=" * 50)
    
    use_cases = [
        {
            "name": "Recherche rapide",
            "description": "Pour des recherches simples et rapides",
            "example": "QuickSearch.search('N8N tutorial')"
        },
        {
            "name": "Analyse de tendances",
            "description": "Pour analyser les tendances d'un domaine",
            "example": "TrendAnalyzer(service).analyze_trends('IA')"
        },
        {
            "name": "Génération de contenu",
            "description": "Pour créer des scripts vidéo personnalisés",
            "example": "VideoScriptGenerator(service).generate_script('Make.com')"
        },
        {
            "name": "Recherche par pays",
            "description": "Pour cibler des résultats géographiques",
            "example": "SearchConfig(country='US', language='en')"
        },
        {
            "name": "Filtrage temporel",
            "description": "Pour des résultats récents ou historiques",
            "example": "SearchConfig(freshness=Freshness.PAST_WEEK)"
        },
        {
            "name": "Sauvegarde automatique",
            "description": "Pour archiver les résultats importants",
            "example": "SearchConfig(save_file=True)"
        }
    ]
    
    for i, use_case in enumerate(use_cases, 1):
        print(f"{i}. **{use_case['name']}**")
        print(f"   {use_case['description']}")
        print(f"   Exemple: {use_case['example']}")
        print()

if __name__ == "__main__":
    print("🚀 DÉMONSTRATION SERVICE DE RECHERCHE FLEXIBLE")
    print("=" * 60)
    print("Inspiré de l'approche CrewAI BraveSearchTool")
    print("=" * 60)
    
    # Montrer les cas d'usage
    show_use_cases()
    
    print("\n" + "🧪 TESTS EN DIRECT")
    print("=" * 60)
    
    try:
        # Démo recherche de base
        demo_basic_search()
        print()
        
        # Démo recherche rapide
        demo_quick_search()
        print()
        
        # Démo configs multiples
        demo_multiple_configs()
        print()
        
        # Démo génération de script
        demo_script_generation()
        print()
        
        print("\n✨ AVANTAGES DE LA FLEXIBILITÉ:")
        print("=" * 60)
        print("✅ Configuration par défaut simple")
        print("✅ Override facile avec des configs personnalisées")
        print("✅ Interfaces spécialisées (QuickSearch, TrendAnalyzer)")
        print("✅ Support multi-provider (extensible)")
        print("✅ Sauvegarde optionnelle")
        print("✅ Formats de sortie configurables")
        print("✅ Intégration facile avec d'autres services")
        
    except Exception as e:
        print(f"❌ Erreur pendant la démo: {e}")
        print("💡 Tip: Vérifiez que BRAVE_API_KEY est configurée") 