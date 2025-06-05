#!/usr/bin/env python3
"""
Script de test pour le service Brave Search
Usage: python test_brave_search.py
"""

import os
import sys
from dotenv import load_dotenv
from services.brave_search_service import brave_search_service

# Charger les variables d'environnement
load_dotenv()

# Ajouter le répertoire courant au path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))


def test_basic_search():
    """Test de recherche basique"""
    print("🔍 Test de recherche basique...")
    
    result = brave_search_service.search("N8N automation tutorial", count=5)
    
    if "error" in result:
        print(f"❌ Erreur: {result['error']}")
        return False
    
    print(f"✅ Recherche réussie! {len(result.get('web', {}).get('results', []))} résultats trouvés")
    
    # Afficher le premier résultat
    if result.get('web', {}).get('results'):
        first_result = result['web']['results'][0]
        print(f"   Premier résultat: {first_result.get('title', 'N/A')}")
    
    return True


def test_video_research():
    """Test de recherche pour vidéo"""
    print("\n📹 Test de recherche pour vidéo...")
    
    video_prompt = "Comment créer des automatisations avec N8N"
    result = brave_search_service.search_for_video_content(video_prompt)
    
    if "error" in result:
        print(f"❌ Erreur: {result['error']}")
        return False
    
    print("✅ Recherche vidéo réussie!")
    
    if result.get('research_summary'):
        summary = result['research_summary']
        print(f"   Points clés trouvés: {len(summary.get('key_points', []))}")
        print(f"   Suggestions de contenu: {len(summary.get('content_suggestions', []))}")
        print(f"   Sources: {summary.get('total_sources', 0)}")
    
    return True


def test_trends_search():
    """Test de recherche de tendances"""
    print("\n📈 Test de recherche de tendances...")
    
    topic = "Intelligence artificielle"
    result = brave_search_service.search_trends_and_insights(topic)
    
    print("✅ Recherche tendances réussie!")
    print(f"   Tendances: {len(result.get('trends', []))}")
    print(f"   Insights: {len(result.get('insights', []))}")
    print(f"   Développements récents: {len(result.get('recent_developments', []))}")
    print(f"   Opportunités de contenu: {len(result.get('content_opportunities', []))}")
    
    return True


def test_api_key_presence():
    """Vérifier la présence de la clé API"""
    print("🔑 Vérification de la clé API...")
    
    if brave_search_service.api_key:
        print("✅ Clé API Brave Search trouvée")
        return True
    else:
        print("❌ Clé API Brave Search manquante")
        print("   Ajoutez BRAVE_API_KEY=votre_cle dans votre fichier .env")
        return False


def main():
    """Fonction principale de test"""
    print("🚀 Test du service Brave Search\n")
    
    # Test de la clé API
    if not test_api_key_presence():
        print("\n❌ Tests arrêtés: clé API manquante")
        return
    
    # Tests des fonctionnalités
    tests = [
        test_basic_search,
        test_video_research,
        test_trends_search
    ]
    
    passed = 0
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Erreur dans le test: {e}")
    
    print(f"\n📊 Résultats: {passed}/{len(tests)} tests réussis")
    
    if passed == len(tests):
        print("🎉 Tous les tests sont passés! Le service Brave Search est prêt.")
    else:
        print("⚠️ Certains tests ont échoué. Vérifiez votre configuration.")


if __name__ == "__main__":
    main() 