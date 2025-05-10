from supabase_service import supabase
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_connection():
    try:
        # Tester la connexion avec une requête simple
        response = supabase.table('tasks').select('count', count='exact').limit(1).execute()
        logger.info(f"Connexion réussie à Supabase - Nombre de tâches: {response.count}")
        return True
    except Exception as e:
        logger.error(f"Erreur de connexion à Supabase: {str(e)}")
        return False

if __name__ == "__main__":
    print("Test de connexion à Supabase...")
    success = test_connection()
    print(f"Résultat: {'Succès' if success else 'Échec'}") 