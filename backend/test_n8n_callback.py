#!/usr/bin/env python3
"""
Script pour tester l'envoi de réponse de N8N vers l'application
"""

import requests
import json
from datetime import datetime

# Configuration
APP_URL = "http://localhost:8000"
N8N_RESPONSE_ENDPOINT = f"{APP_URL}/api/n8n/response"
N8N_NOTIFICATION_ENDPOINT = f"{APP_URL}/api/n8n/notification"


def test_video_script_response():
    """Teste l'envoi d'un script vidéo depuis N8N"""
    print("🎬 Test envoi script vidéo depuis N8N")
    print("=" * 50)
    
    script_response = {
        "request_id": "video_20250605_123456",
        "result_type": "video_script",
        "content": """
# Script Vidéo : Automatisation N8N

## Introduction (0-30s)
Salut tout le monde ! C'est Maxens, CTO de l'Orra Academy. 
Aujourd'hui on va voir comment automatiser votre workflow avec N8N.

## Corps principal (30s-3min)
- Configuration du webhook
- Création d'agents IA
- Automatisation de la newsletter
- Intégration avec Telegram

## Conclusion (3-4min)
Voilà comment créer une automatisation complète !
Retrouvez la formation complète sur orra-academy.com
        """,
        "metadata": {
            "generated_by": "N8N AI Agent",
            "original_prompt": "Créer un tutoriel sur l'automatisation N8N",
            "processing_time": "45s"
        },
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        response = requests.post(
            N8N_RESPONSE_ENDPOINT,
            headers={'Content-Type': 'application/json'},
            json=script_response,
            timeout=10
        )
        
        print(f"✅ Status: {response.status_code}")
        print(f"✅ Response: {response.json()}")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")


def test_notification():
    """Teste l'envoi d'une notification depuis N8N"""
    print("\n🔔 Test notification depuis N8N")
    print("=" * 50)
    
    notification = {
        "event_type": "task_completed",
        "original_prompt": "Créer un tutoriel sur l'automatisation N8N",
        "result": {
            "script_generated": True,
            "telegram_sent": True,
            "newsletter_updated": True
        },
        "status": "success",
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        response = requests.post(
            N8N_NOTIFICATION_ENDPOINT,
            headers={'Content-Type': 'application/json'},
            json=notification,
            timeout=10
        )
        
        print(f"✅ Status: {response.status_code}")
        print(f"✅ Response: {response.json()}")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")


def test_analysis_response():
    """Teste l'envoi d'une analyse depuis N8N"""
    print("\n📊 Test analyse depuis N8N")
    print("=" * 50)
    
    analysis_response = {
        "request_id": "analysis_20250605_123456",
        "result_type": "analysis",
        "content": """
Analyse du prompt "Automatisation N8N":

🎯 Intention: Formation technique
📈 Popularité: Très élevée (trend +45%)
💡 Recommandations:
- Créer série de vidéos (3-5 épisodes)
- Focus sur cas d'usage concrets
- Ajouter démonstrations pratiques

🔍 Mots-clés suggérés:
- automatisation
- workflow
- agents IA
- productivité
        """,
        "metadata": {
            "confidence_score": 0.92,
            "keywords_found": 15,
            "trend_analysis": "positive"
        },
        "timestamp": datetime.now().isoformat()
    }
    
    try:
        response = requests.post(
            N8N_RESPONSE_ENDPOINT,
            headers={'Content-Type': 'application/json'},
            json=analysis_response,
            timeout=10
        )
        
        print(f"✅ Status: {response.status_code}")
        print(f"✅ Response: {response.json()}")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")


if __name__ == "__main__":
    print("🚀 Test communication N8N → Application")
    print("=" * 60)
    
    # Tester les différents types de réponses
    test_video_script_response()
    test_notification()
    test_analysis_response()
    
    print("\n✅ Tests terminés!")
    print("\n💡 Dans N8N, utilisez HTTP Request Node avec:")
    print(f"   URL: {N8N_RESPONSE_ENDPOINT}")
    print("   Method: POST")
    print("   Headers: Content-Type: application/json")
    print("   Body: JSON selon le modèle N8NResponse") 