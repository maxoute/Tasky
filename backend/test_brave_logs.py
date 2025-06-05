#!/usr/bin/env python3
"""
Test des logs détaillés Brave Search
"""

import sys
import os
import logging

# Configuration des logs pour voir le détail
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.flexible_search_service import (
    FlexibleSearchService,
    SearchConfig,
    SearchProvider,
    QuickSearch
)

def test_brave_search_with_logs():
    """Test d'une recherche Brave avec logs détaillés"""
    print("🧪 TEST LOGS BRAVE SEARCH")
    print("=" * 50)
    
    # Configuration simple
    config = SearchConfig(
        provider=SearchProvider.BRAVE,
        n_results=3,
        country="FR",
        language="fr"
    )
    
    print("📋 Configuration utilisée:")
    print(f"   Provider: {config.provider.value}")
    print(f"   Pays: {config.country}")
    print(f"   Langue: {config.language}")
    print(f"   Résultats: {config.n_results}")
    print()
    
    # Test avec le service
    service = FlexibleSearchService(config)
    
    print("🚀 Lancement de la recherche...")
    print("=" * 30)
    
    # Recherche test
    results = service.search("Python automation tutorial")
    
    print("=" * 30)
    print("📊 RÉSULTAT:")
    
    if results.get("success"):
        print(f"✅ Succès - {results['total_results']} résultats trouvés")
        
        # Afficher les premiers résultats
        for i, result in enumerate(results['results'][:2], 1):
            print(f"   {i}. {result['title'][:60]}...")
            print(f"      URL: {result['url']}")
        
    else:
        print(f"❌ Erreur: {results.get('error')}")
    
    print()
    print("🎯 Les logs détaillés sont visibles ci-dessus !")

def test_quicksearch_with_logs():
    """Test QuickSearch avec logs"""
    print("\n🚀 TEST QUICKSEARCH AVEC LOGS")
    print("=" * 50)
    
    print("🔍 Recherche QuickSearch...")
    results = QuickSearch.search("N8N automation", n_results=2)
    
    if results:
        print(f"✅ QuickSearch: {len(results)} résultats")
        for i, result in enumerate(results[:1], 1):
            print(f"   {i}. {result['title'][:50]}...")
    else:
        print("❌ Aucun résultat QuickSearch")

if __name__ == "__main__":
    print("🔥 DÉMONSTRATION LOGS BRAVE SEARCH")
    print("=" * 60)
    
    # Vérifier que l'API key est présente
    api_key = os.getenv('BRAVE_API_KEY')
    print(f"🔑 BRAVE_API_KEY: {'✅ Configurée' if api_key else '❌ Manquante'}")
    
    if api_key:
        print(f"🔑 API Key (début): {api_key[:10]}...")
    
    print()
    
    try:
        # Test principal
        test_brave_search_with_logs()
        
        # Test QuickSearch
        test_quicksearch_with_logs()
        
        print("\n✨ Tests terminés ! Regardez les logs détaillés ci-dessus.")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        import traceback
        traceback.print_exc() 