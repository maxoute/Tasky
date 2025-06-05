#!/usr/bin/env python3
"""
Test d'intégration Google Custom Search API
Démontre la compatibilité multi-provider du service flexible
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
    QuickSearch
)

def test_google_vs_brave_comparison():
    """Compare les résultats Google vs Brave pour la même requête"""
    print("🔍 COMPARAISON GOOGLE vs BRAVE SEARCH")
    print("=" * 50)
    
    query = "Python automation tutorial"
    
    # Configuration pour Google
    google_config = SearchConfig(
        provider=SearchProvider.GOOGLE,
        n_results=5,
        country="US",
        language="en"
    )
    
    # Configuration pour Brave  
    brave_config = SearchConfig(
        provider=SearchProvider.BRAVE,
        n_results=5,
        country="US", 
        language="en"
    )
    
    print(f"🔍 Recherche: '{query}'")
    print()
    
    # Test Google
    print("📍 GOOGLE CUSTOM SEARCH:")
    google_service = FlexibleSearchService(google_config)
    google_results = google_service.search(query)
    
    if google_results.get("success"):
        print(f"✅ {google_results['total_results']} résultats trouvés")
        if google_results.get("provider_metadata"):
            print(f"📊 Estimation totale: {google_results['provider_metadata']['total_results_estimate']}")
            print(f"⚡ Temps de recherche: {google_results['provider_metadata']['search_time']}s")
        
        print("\nTop 3 résultats Google:")
        for i, result in enumerate(google_results['results'][:3], 1):
            print(f"{i}. {result['title']}")
            print(f"   URL: {result['url']}")
            print(f"   Mots-clés: {result['keywords']}")
            print()
    else:
        print(f"❌ Erreur Google: {google_results.get('error')}")
    
    print("-" * 50)
    
    # Test Brave
    print("📍 BRAVE SEARCH:")
    brave_service = FlexibleSearchService(brave_config)
    brave_results = brave_service.search(query)
    
    if brave_results.get("success"):
        print(f"✅ {brave_results['total_results']} résultats trouvés")
        
        print("\nTop 3 résultats Brave:")
        for i, result in enumerate(brave_results['results'][:3], 1):
            print(f"{i}. {result['title']}")
            print(f"   URL: {result['url']}")
            print(f"   Mots-clés: {result['keywords']}")
            print()
    else:
        print(f"❌ Erreur Brave: {brave_results.get('error')}")

def test_google_advanced_features():
    """Teste les fonctionnalités avancées avec Google"""
    print("\n🚀 FONCTIONNALITÉS AVANCÉES GOOGLE")
    print("=" * 50)
    
    # Configuration avancée Google
    advanced_config = SearchConfig(
        provider=SearchProvider.GOOGLE,
        country="FR",
        language="fr",
        n_results=8,
        freshness=Freshness.PAST_WEEK,
        safesearch=SafeSearch.MODERATE,
        save_file=True
    )
    
    service = FlexibleSearchService(advanced_config)
    results = service.search("intelligence artificielle 2024")
    
    if results.get("success"):
        print(f"✅ Recherche avancée réussie")
        print(f"📍 Provider: Google Custom Search")
        print(f"🌍 Pays: {results['config_used']['country']}")
        print(f"🗣️ Langue: {results['config_used']['language']}")
        print(f"📅 Fraîcheur: {results['config_used']['freshness']}")
        print(f"🔒 SafeSearch: {results['config_used']['safesearch']}")
        print(f"💾 Sauvegarde: {results['config_used']['save_file']}")
        print(f"📊 Résultats: {results['total_results']}")
        
        if results.get("provider_metadata"):
            print(f"🎯 Estimation totale: {results['provider_metadata']['total_results_estimate']}")
    else:
        print(f"❌ Erreur: {results.get('error')}")

def test_multi_provider_flexibility():
    """Teste la flexibilité multi-provider"""
    print("\n🎯 FLEXIBILITÉ MULTI-PROVIDER")
    print("=" * 50)
    
    queries = [
        ("Google", SearchProvider.GOOGLE, "machine learning"),
        ("Brave", SearchProvider.BRAVE, "automation tools"),
        ("Google", SearchProvider.GOOGLE, "N8N workflows")
    ]
    
    for provider_name, provider, query in queries:
        config = SearchConfig(provider=provider, n_results=3)
        service = FlexibleSearchService(config)
        results = service.search(query)
        
        if results.get("success"):
            print(f"✅ {provider_name}: '{query}' - {results['total_results']} résultats")
        else:
            print(f"❌ {provider_name}: '{query}' - {results.get('error')}")

def show_google_requirements():
    """Affiche les prérequis pour Google Custom Search"""
    print("📋 PRÉREQUIS GOOGLE CUSTOM SEARCH")
    print("=" * 50)
    
    google_api_key = os.getenv('GOOGLE_API_KEY')
    google_search_engine_id = os.getenv('GOOGLE_SEARCH_ENGINE_ID')
    
    print("Variables d'environnement requises:")
    print(f"🔑 GOOGLE_API_KEY: {'✅ Configurée' if google_api_key else '❌ Manquante'}")
    print(f"🔍 GOOGLE_SEARCH_ENGINE_ID: {'✅ Configurée' if google_search_engine_id else '❌ Manquante'}")
    
    if not google_api_key or not google_search_engine_id:
        print("\n💡 CONFIGURATION REQUISE:")
        print("1. Créer un projet sur Google Cloud Console")
        print("2. Activer l'API Custom Search JSON")
        print("3. Créer une clé API")
        print("4. Créer un moteur de recherche personnalisé")
        print("5. Configurer les variables:")
        print("   export GOOGLE_API_KEY='your_google_api_key'")
        print("   export GOOGLE_SEARCH_ENGINE_ID='your_search_engine_id'")
    
    print(f"\n📚 Documentation: https://developers.google.com/custom-search/v1/using_rest")

def show_api_comparison():
    """Compare les APIs Google et Brave"""
    print("\n📊 COMPARAISON DES APIs")
    print("=" * 50)
    
    comparison = [
        ("Aspect", "Google Custom Search", "Brave Search"),
        ("---", "---", "---"),
        ("Résultats/requête", "Max 10", "Max 20"),
        ("Coût", "Gratuit jusqu'à 100/jour", "Plan selon usage"),
        ("Personnalisation", "Moteur personnalisé", "Goggles"),
        ("Fraîcheur", "dateRestrict", "Filtres avancés"),
        ("SafeSearch", "off/medium/high", "off/moderate/strict"),
        ("Métadonnées", "Estimation + temps", "Basique"),
        ("Langues", "lr parameter", "search_lang"),
        ("Pays", "gl parameter", "country")
    ]
    
    for row in comparison:
        print(f"{row[0]:<20} | {row[1]:<20} | {row[2]:<20}")

if __name__ == "__main__":
    print("🚀 TEST D'INTÉGRATION GOOGLE CUSTOM SEARCH")
    print("=" * 60)
    
    # Afficher les prérequis
    show_google_requirements()
    
    print("\n" + "🧪 TESTS DE COMPATIBILITÉ")
    print("=" * 60)
    
    try:
        # Test de comparaison
        test_google_vs_brave_comparison()
        
        # Test des fonctionnalités avancées
        test_google_advanced_features()
        
        # Test de flexibilité
        test_multi_provider_flexibility()
        
        # Comparaison des APIs
        show_api_comparison()
        
        print("\n✨ AVANTAGES DU SUPPORT MULTI-PROVIDER:")
        print("=" * 60)
        print("✅ Flexibilité maximale - Choisir le meilleur provider selon le contexte")
        print("✅ Résilience - Fallback automatique en cas de problème")
        print("✅ Optimisation coûts - Combiner gratuit/payant selon les besoins")
        print("✅ Comparaison résultats - Croiser les sources pour plus de pertinence")
        print("✅ Spécialisation - Google pour recherche générale, Brave pour privacy")
        
    except Exception as e:
        print(f"❌ Erreur pendant les tests: {e}")
        print("💡 Tip: Vérifiez que GOOGLE_API_KEY et GOOGLE_SEARCH_ENGINE_ID sont configurées") 