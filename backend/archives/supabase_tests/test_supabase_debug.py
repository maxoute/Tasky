import os
from dotenv import load_dotenv
import logging
import json
import requests

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Chargement manuel des variables d'environnement
load_dotenv()

def debug_supabase_keys():
    # Récupérer les informations de connexion
    url = os.getenv("SUPABASE_URL")
    anon_key = os.getenv("SUPABASE_KEY")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    # Afficher les informations de déboggage
    print(f"URL Supabase: {url}")
    print(f"SUPABASE_KEY (longueur): {len(anon_key) if anon_key else 'Non définie'}")
    print(f"SUPABASE_SERVICE_KEY (longueur): {len(service_key) if service_key else 'Non définie'}")
    
    # Tester les URLs directement
    headers_anon = {
        "apikey": anon_key,
        "Authorization": f"Bearer {anon_key}",
        "Content-Type": "application/json"
    }
    
    headers_service = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json"
    }
    
    # Test avec clé anonyme
    try:
        response = requests.get(f"{url}/rest/v1/tasks?select=count", 
                                headers=headers_anon, 
                                params={"count": "exact", "limit": 1})
        print("\nTest avec clé anonyme (SUPABASE_KEY):")
        print(f"Statut: {response.status_code}")
        print(f"Réponse: {response.text}")
    except Exception as e:
        print(f"Erreur lors du test avec clé anonyme: {str(e)}")
    
    # Test avec clé de service
    try:
        response = requests.get(f"{url}/rest/v1/tasks?select=count", 
                                headers=headers_service, 
                                params={"count": "exact", "limit": 1})
        print("\nTest avec clé de service (SUPABASE_SERVICE_KEY):")
        print(f"Statut: {response.status_code}")
        print(f"Réponse: {response.text}")
    except Exception as e:
        print(f"Erreur lors du test avec clé de service: {str(e)}")


if __name__ == "__main__":
    print("Débogage des clés Supabase...")
    debug_supabase_keys() 