#!/usr/bin/env python3
"""
Script de test pour valider le webhook N8N d'Orra Academy
URL: https://n8n.orra-academy.com/webhook-test/a91757b0-e982-4343-bcfd-87b807eb34d7
"""

import os
import requests
import json
from datetime import datetime
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration
WEBHOOK_URL = "https://n8n.orra-academy.com/webhook-test/a91757b0-e982-4343-bcfd-87b807eb34d7"
API_BASE_URL = "http://localhost:8000"

def test_direct_webhook():
    """Test direct du webhook N8N sans passer par notre API"""
    print("🔍 Test direct du webhook N8N...")
    
    test_payload = {
        "event_type": "test_direct",
        "timestamp": datetime.now().isoformat(),
        "source": "test_script",
        "data": {
            "message": "Test direct depuis le script de validation",
            "user": "Maxens - Orra Academy",
            "test_type": "direct_webhook"
        },
        "metadata": {
            "generated_by": "Test Script Orra Academy",
            "version": "1.0"
        }
    }
    
    try:
        response = requests.post(
            WEBHOOK_URL,
            json=test_payload,
            headers={
                "Content-Type": "application/json",
                "User-Agent": "Orra-Academy-Test/1.0"
            },
            timeout=30
        )
        
        print(f"✅ Status Code: {response.status_code}")
        print(f"✅ Response: {response.text[:200]}...")
        
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_api_webhook_status():
    """Test du statut webhook via notre API"""
    print("\n🔍 Test du statut webhook via l'API...")
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/search/webhook/status")
        data = response.json()
        
        print(f"✅ Webhook activé: {data.get('webhook_enabled')}")
        print(f"✅ Webhook configuré: {data.get('webhook_configured')}")
        print(f"✅ URL: {data.get('webhook_url')}")
        
        return data.get('webhook_configured', False)
        
    except Exception as e:
        print(f"❌ Erreur API: {e}")
        return False

def test_api_webhook_test():
    """Test du webhook via l'endpoint API de test"""
    print("\n🔍 Test webhook via l'API...")
    
    try:
        response = requests.post(f"{API_BASE_URL}/api/search/test-webhook")
        data = response.json()
        
        print(f"✅ Succès: {data.get('success')}")
        print(f"✅ Webhook result: {data.get('webhook_result', {}).get('status')}")
        
        return data.get('success', False)
        
    except Exception as e:
        print(f"❌ Erreur API: {e}")
        return False

def test_prompt_only():
    """Test d'envoi d'un prompt seulement"""
    print("\n🔍 Test envoi prompt seulement...")
    
    payload = {
        "topic": "Test N8N Orra Academy",
        "target_audience": "développeurs"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/search/video/send-prompt",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        data = response.json()
        
        print(f"✅ Succès: {data.get('success')}")
        print(f"✅ Topic: {data.get('topic')}")
        print(f"✅ Webhook status: {data.get('webhook_result', {}).get('status')}")
        
        return data.get('success', False)
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def test_full_script_generation():
    """Test complet de génération de script avec webhook"""
    print("\n🔍 Test génération complète avec webhook...")
    
    payload = {
        "topic": "Automatisation avec N8N pour Orra Academy",
        "target_audience": "entrepreneurs"
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/api/search/video/script-with-webhook",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        data = response.json()
        
        print(f"✅ Succès: {data.get('success')}")
        print(f"✅ Script généré: {len(data.get('script', '')) > 0}")
        print(f"✅ Prompt webhook: {data.get('prompt_webhook_status', {}).get('status')}")
        print(f"✅ Final webhook: {data.get('final_webhook_status', {}).get('status')}")
        
        return data.get('success', False)
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

def main():
    """Fonction principale de test"""
    print("🚀 Tests de validation Webhook N8N Orra Academy")
    print("=" * 60)
    print(f"Webhook URL: {WEBHOOK_URL}")
    print(f"API URL: {API_BASE_URL}")
    print("=" * 60)
    
    tests = [
        ("Test direct webhook", test_direct_webhook),
        ("Test statut API", test_api_webhook_status),
        ("Test webhook API", test_api_webhook_test),
        ("Test prompt seulement", test_prompt_only),
        ("Test génération complète", test_full_script_generation)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ Erreur dans {test_name}: {e}")
            results.append((test_name, False))
    
    # Résumé
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 60)
    
    for test_name, result in results:
        status = "✅ SUCCÈS" if result else "❌ ÉCHEC"
        print(f"{status} - {test_name}")
    
    total_success = sum(1 for _, result in results if result)
    print(f"\n📈 Résultat global: {total_success}/{len(results)} tests réussis")
    
    if total_success == len(results):
        print("🎉 Tous les tests sont passés ! Le webhook est opérationnel.")
    else:
        print("⚠️  Certains tests ont échoué. Vérifiez la configuration.")

if __name__ == "__main__":
    main() 