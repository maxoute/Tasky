#!/usr/bin/env python3
"""
Script de test pour l'API vidéos et la table Supabase
"""

import requests
import json
import time
from datetime import datetime, timedelta


def test_videos_api():
    """Test complet de l'API vidéos"""
    
    BASE_URL = "http://localhost:8000/api/videos"
    
    print("🧪 Test de l'API Vidéos - Mentor IA")
    print("=" * 50)
    
    # 1. Test de santé
    print("\n1. 🏥 Test de santé du service...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            health = response.json()
            print(f"✅ Service vidéos: {health.get('status')}")
            print(f"📊 DB connectée: {health.get('database_connected')}")
            print(f"📹 Vidéos totales: {health.get('total_videos')}")
        else:
            print(f"❌ Erreur health check: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur connexion: {e}")
        return False
    
    # 2. Récupération des vidéos existantes
    print("\n2. 📋 Récupération des vidéos...")
    try:
        response = requests.get(BASE_URL)
        if response.status_code == 200:
            videos_data = response.json()
            videos = videos_data.get("videos", [])
            print(f"✅ {len(videos)} vidéos récupérées")
            for video in videos[:3]:  # Afficher les 3 premières
                print(f"   📹 {video.get('title')} ({video.get('status')})")
        else:
            print(f"❌ Erreur récupération: {response.status_code}")
    except Exception as e:
        print(f"❌ Erreur: {e}")
    
    # 3. Statistiques
    print("\n3. 📊 Statistiques des vidéos...")
    try:
        response = requests.get(f"{BASE_URL}/stats")
        if response.status_code == 200:
            stats_data = response.json()
            stats = stats_data.get("stats", {})
            print(f"✅ Statistiques récupérées:")
            print(f"   📹 Total: {stats.get('total_videos', 0)}")
            print(f"   🎬 À tourner: {stats.get('videos_a_tourner', 0)}")
            print(f"   ✂️ À monter: {stats.get('videos_a_monter', 0)}")
            print(f"   📤 À publier: {stats.get('videos_a_publier', 0)}")
            print(f"   ✅ Publiées: {stats.get('videos_publiees', 0)}")
            print(f"   🔍 Enrichies: {stats.get('videos_enriched', 0)}")
        else:
            print(f"❌ Erreur statistiques: {response.status_code}")
    except Exception as e:
        print(f"❌ Erreur: {e}")
    
    # 4. Création d'une nouvelle vidéo de test
    print("\n4. ➕ Création d'une vidéo de test...")
    new_video_data = {
        "title": f"Test API - {datetime.now().strftime('%H:%M:%S')}",
        "prompt": "Tester l'API de création de vidéos",
        "script": "# Script de test\n\nCeci est un test automatique de l'API vidéos.",
        "status": "a_tourner",
        "priority": "medium",
        "category": "Test",
        "deadline": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
        "estimated_duration": 5
    }
    
    try:
        response = requests.post(BASE_URL, json=new_video_data)
        if response.status_code == 200:
            created_video = response.json().get("video", {})
            video_id = created_video.get("id")
            print(f"✅ Vidéo créée avec l'ID: {video_id}")
            print(f"   📹 Titre: {created_video.get('title')}")
            print(f"   📊 Statut: {created_video.get('status')}")
            
            # 5. Mise à jour de la vidéo
            print("\n5. ✏️ Mise à jour de la vidéo...")
            update_data = {
                "status": "a_monter",
                "script": "# Script mis à jour\n\nScript enrichi avec de nouvelles informations."
            }
            
            response = requests.put(f"{BASE_URL}/{video_id}", json=update_data)
            if response.status_code == 200:
                updated_video = response.json().get("video", {})
                print(f"✅ Vidéo mise à jour:")
                print(f"   📊 Nouveau statut: {updated_video.get('status')}")
            else:
                print(f"❌ Erreur mise à jour: {response.status_code}")
            
            # 6. Enrichissement avec recherche (simulation)
            print("\n6. 🔍 Test d'enrichissement avec recherche...")
            research_data = {
                "research_summary": {
                    "key_points": ["Point clé 1", "Point clé 2", "Point clé 3"],
                    "content_suggestions": ["Suggestion 1", "Suggestion 2"],
                    "trending_topics": ["Tendance 1", "Tendance 2"]
                },
                "sources": [
                    {"title": "Source 1", "url": "https://example1.com"},
                    {"title": "Source 2", "url": "https://example2.com"}
                ]
            }
            
            response = requests.post(f"{BASE_URL}/{video_id}/enrich", json=research_data)
            if response.status_code == 200:
                enriched_video = response.json().get("video", {})
                print(f"✅ Vidéo enrichie avec succès")
                print(f"   🔍 Enrichie: {enriched_video.get('enriched_with_search')}")
            else:
                print(f"❌ Erreur enrichissement: {response.status_code}")
            
            # 7. Récupération par ID
            print("\n7. 🔍 Récupération par ID...")
            response = requests.get(f"{BASE_URL}/{video_id}")
            if response.status_code == 200:
                video = response.json().get("video", {})
                print(f"✅ Vidéo récupérée par ID:")
                print(f"   📹 Titre: {video.get('title')}")
                print(f"   📊 Statut: {video.get('status')}")
                print(f"   🔍 Enrichie: {video.get('enriched_with_search')}")
            else:
                print(f"❌ Erreur récupération par ID: {response.status_code}")
            
            # 8. Recherche
            print("\n8. 🔎 Test de recherche...")
            response = requests.get(f"{BASE_URL}/search", params={"q": "test"})
            if response.status_code == 200:
                search_results = response.json()
                videos_found = search_results.get("videos", [])
                print(f"✅ Recherche terminée: {len(videos_found)} résultats")
                for video in videos_found[:2]:
                    print(f"   📹 {video.get('title')}")
            else:
                print(f"❌ Erreur recherche: {response.status_code}")
            
            # 9. Suppression de la vidéo de test
            print("\n9. 🗑️ Suppression de la vidéo de test...")
            response = requests.delete(f"{BASE_URL}/{video_id}")
            if response.status_code == 200:
                print("✅ Vidéo de test supprimée avec succès")
            else:
                print(f"❌ Erreur suppression: {response.status_code}")
            
        else:
            print(f"❌ Erreur création: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur création vidéo: {e}")
    
    # 10. Test final des statistiques
    print("\n10. 📊 Statistiques finales...")
    try:
        response = requests.get(f"{BASE_URL}/stats")
        if response.status_code == 200:
            stats_data = response.json()
            stats = stats_data.get("stats", {})
            print(f"✅ Total final: {stats.get('total_videos', 0)} vidéos")
        else:
            print(f"❌ Erreur statistiques finales: {response.status_code}")
    except Exception as e:
        print(f"❌ Erreur: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 Tests terminés!")
    return True


if __name__ == "__main__":
    print("Démarrage des tests de l'API vidéos...")
    print("Assurez-vous que le backend FastAPI est en cours d'exécution sur http://localhost:8000")
    print()
    
    # Attendre un peu pour que l'utilisateur puisse lire
    time.sleep(2)
    
    try:
        success = test_videos_api()
        if success:
            print("\n✅ Tous les tests sont terminés!")
        else:
            print("\n❌ Certains tests ont échoué!")
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrompus par l'utilisateur")
    except Exception as e:
        print(f"\n❌ Erreur inattendue: {e}") 