#!/usr/bin/env python3
"""
Script de démarrage pour l'application avec configuration webhook N8N
"""

import os
import uvicorn

# Configuration des variables d'environnement
os.environ['N8N_WEBHOOK_ENABLED'] = 'true'
os.environ['N8N_WEBHOOK_URL'] = 'https://n8n.orra-academy.com/webhook-test/a91757b0-e982-4343-bcfd-87b807eb34d7'
os.environ['ENVIRONMENT'] = 'development'

if __name__ == "__main__":
    print("🚀 Démarrage de l'application avec webhook N8N configuré")
    print(f"📡 Webhook URL: {os.environ['N8N_WEBHOOK_URL']}")
    print(f"✅ Webhook activé: {os.environ['N8N_WEBHOOK_ENABLED']}")
    print("-" * 60)
    
    uvicorn.run(
        "app_fastapi:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    ) 