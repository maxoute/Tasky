#!/usr/bin/env python3
import os

# Configurer les variables d'environnement
os.environ['N8N_WEBHOOK_ENABLED'] = 'true'
os.environ['N8N_WEBHOOK_URL'] = 'https://n8n.orra-academy.com/webhook/a91757b0-e982-4343-bcfd-87b807eb34d7'

print("🚀 Variables configurées:")
print(f"N8N_WEBHOOK_ENABLED = {os.environ.get('N8N_WEBHOOK_ENABLED')}")
print(f"N8N_WEBHOOK_URL = {os.environ.get('N8N_WEBHOOK_URL')}")

# Importer l'app
from app_fastapi import app

print("✅ App importée avec succès!")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info") 