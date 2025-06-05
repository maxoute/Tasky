#!/usr/bin/env python3
"""
Script pour envoyer directement le prompt vers le webhook N8N
"""

import requests
import json
from datetime import datetime

# Configuration pour le test webhook N8N
N8N_WEBHOOK_URL = "https://n8n.orra-academy.com/webhook/a91757b0-e982-4343-bcfd-87b807eb34d7"

def test_webhook():
    print("🚀 Test direct du webhook N8N Orra Academy")
    print("=" * 60)
    
    # Données à envoyer
    test_data = {
        "event_type": "video_prompt_received",
        "timestamp": datetime.now().isoformat(),
        "source": "direct_script",
        "data": {
            "topic": "Générateur de vidéos IA - Décrivez un projet ou un objectif, et l'IA générera des vidéos pertinentes pour vous aider à l'accomplir",
            "target_audience": "créateurs de contenu",
            "request_id": f"video_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "status": "prompt_received",
            "next_action": "generate_script"
        },
        "metadata": {
            "generated_by": "Orra Academy - Direct Test",
            "version": "1.0",
            "user": "Maxens - CTO Orra Academy"
        }
    }
    
    print(f"📡 Envoi du prompt vers N8N...")
    print(f"URL: {N8N_WEBHOOK_URL}")
    print(f"Topic: {test_data['data']['topic']}")
    print("-" * 60)
    
    # Headers
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Orra-Academy-DirectTest/1.0'
    }
    
    # Test avec POST
    try:
        print("🔄 Tentative avec POST...")
        response = requests.post(
            N8N_WEBHOOK_URL,
            headers=headers,
            json=test_data,
            timeout=10
        )
        
        print(f"POST - Status: {response.status_code}")
        print(f"POST - Response: {response.text}")
        
    except Exception as e:
        print(f"POST - Erreur: {e}")
    
    # Test avec GET (au cas où)
    try:
        print("\n🔄 Tentative avec GET...")
        response = requests.get(
            N8N_WEBHOOK_URL,
            timeout=10
        )
        
        print(f"GET - Status: {response.status_code}")
        print(f"GET - Response: {response.text}")
        
    except Exception as e:
        print(f"GET - Erreur: {e}")
    
    print("\n✅ Test terminé!")

def test_webhook_optimized():
    """Test avec une structure de données optimisée pour N8N"""
    print("🎯 Test webhook optimisé pour N8N")
    print("=" * 60)
    
    # Structure optimisée pour N8N workflow
    optimized_data = {
        "trigger": "user_prompt",
        "prompt": "Créer un tutoriel sur l'automatisation N8N",
        "user": {
            "name": "Maxens",
            "role": "CTO Orra Academy",
            "source": "tasky_interface"
        },
        "config": {
            "target_audience": "entrepreneurs",
            "content_type": "video_script",
            "urgency": "normal",
            "language": "fr"
        },
        "metadata": {
            "timestamp": datetime.now().isoformat(),
            "request_id": f"req_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "version": "2.0"
        }
    }
    
    print(f"📡 Structure optimisée pour webhook N8N:")
    print(f"Prompt: {optimized_data['prompt']}")
    print(f"User: {optimized_data['user']['name']}")
    print(f"Config: {optimized_data['config']}")
    print("-" * 60)
    
    headers = {
        'Content-Type': 'application/json',
        'User-Agent': 'Orra-Academy-Optimized/2.0'
    }
    
    try:
        response = requests.post(
            N8N_WEBHOOK_URL,
            headers=headers,
            json=optimized_data,
            timeout=10
        )
        
        print(f"✅ Status: {response.status_code}")
        print(f"✅ Response: {response.text}")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    # Test standard
    test_webhook()
    
    print("\n" + "="*60 + "\n")
    
    # Test optimisé
    test_webhook_optimized() 