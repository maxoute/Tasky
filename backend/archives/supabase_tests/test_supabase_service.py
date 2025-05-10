import os
from dotenv import load_dotenv
from supabase import create_client
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Chargement manuel des variables d'environnement
load_dotenv()

def test_connection():
    try:
        # Récupérer les informations de connexion
        url = os.getenv("SUPABASE_URL")
        service_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not url or not service_key:
            logger.error("Variables d'environnement manquantes: SUPABASE_URL ou SUPABASE_SERVICE_KEY")
            return False
            
        logger.info(f"URL Supabase: {url}")
        logger.info(f"Clé de service disponible: {'Oui' if service_key else 'Non'}")
        
        # Créer un client Supabase avec la clé de service
        supabase = create_client(url, service_key)
        
        # Tester la connexion avec une requête simple
        response = supabase.table('tasks').select('count', count='exact').limit(1).execute()
        logger.info(f"Connexion réussie à Supabase - Nombre de tâches: {response.count}")
        return True
    except Exception as e:
        logger.error(f"Erreur de connexion à Supabase: {str(e)}")
        return False


if __name__ == "__main__":
    print("Test de connexion à Supabase avec la clé de service...")
    success = test_connection()
    print(f"Résultat: {'Succès' if success else 'Échec'}") 