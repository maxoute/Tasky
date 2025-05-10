"""
Service pour gérer les interactions avec Supabase avec correction pour la variable d'environnement
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Chargement des variables d'environnement
load_dotenv()

class SupabaseService:
    """Service pour interagir avec la base de données Supabase"""
    
    _instance = None
    
    def __new__(cls):
        """Implémentation du pattern Singleton pour éviter de créer plusieurs clients"""
        if cls._instance is None:
            cls._instance = super(SupabaseService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialise la connexion à Supabase"""
        try:
            # Correction ici : utiliser SUPABASE_KEY au lieu de SUPABASE_ANON_KEY
            url = os.environ.get("SUPABASE_URL")
            key = os.environ.get("SUPABASE_KEY")  # MODIFIÉ: utiliser SUPABASE_KEY
            
            if not url or not key:
                raise ValueError("Les variables d'environnement SUPABASE_URL et SUPABASE_KEY sont requises")
            
            logger.info(f"Configuration de Supabase avec URL: {url} et clé de longueur: {len(key)}")
            self.supabase: Client = create_client(url, key)
            logger.info("Connexion à Supabase établie avec succès")
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation de Supabase: {str(e)}")
            raise
    
    # Implémentez ici vos méthodes pour interagir avec la base de données
    async def test_connection(self):
        """Teste la connexion à Supabase"""
        try:
            response = self.supabase.table('tasks').select('count', count='exact').limit(1).execute()
            logger.info(f"Connexion réussie - Nombre de tâches: {response.count}")
            return True
        except Exception as e:
            logger.error(f"Échec du test de connexion: {str(e)}")
            return False

# Pour tester ce service
if __name__ == "__main__":
    print("Test du service Supabase corrigé...")
    service = SupabaseService()
    
    # Test synchrone
    try:
        # Appel d'une méthode synchrone
        response = service.supabase.table('tasks').select('count', count='exact').limit(1).execute()
        print(f"Connexion OK, nombre de tâches: {response.count}")
    except Exception as e:
        print(f"Erreur lors du test: {str(e)}")
    
    # Pour exécuter un test asynchrone, vous auriez besoin d'un event loop
    import asyncio
    
    async def run_async_test():
        result = await service.test_connection()
        print(f"Test asynchrone: {'Succès' if result else 'Échec'}")
    
    # Exécuter le test asynchrone
    asyncio.run(run_async_test()) 