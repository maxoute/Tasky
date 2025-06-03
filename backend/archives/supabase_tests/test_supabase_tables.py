import os
from dotenv import load_dotenv
from supabase import create_client
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Chargement manuel des variables d'environnement
load_dotenv()

def list_tables():
    try:
        # Récupérer les informations de connexion
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_KEY")  # Utiliser la clé de service pour les opérations système
        
        if not url or not key:
            logger.error("Variables d'environnement manquantes: SUPABASE_URL ou SUPABASE_SERVICE_KEY")
            return False
            
        logger.info(f"URL Supabase: {url}")
        logger.info(f"Clé de service disponible: {'Oui' if key else 'Non'}")
        
        # Créer un client Supabase
        supabase = create_client(url, key)
        
        print("Tentative de lister les tables disponibles...")
        
        # Tester avec quelques tables communes
        for table in ['users', 'profiles', 'tasks', 'todos', 'categories']:
            try:
                response = supabase.table(table).select('*').limit(1).execute()
                print(f"Table '{table}' trouvée! ({len(response.data)} enregistrements)")
            except Exception as e:
                print(f"Table '{table}' non accessible: {str(e)}")
        
        # Essayons de voir les schémas de la base de données
        # Cette méthode n'est pas standard et peut ne pas fonctionner
        try:
            rpc_response = supabase.rpc('get_schemas', {}).execute()
            print(f"Résultat RPC schemas: {rpc_response.data}")
        except Exception as e:
            print(f"Impossible d'obtenir les schémas: {str(e)}")
        
        return True
    except Exception as e:
        logger.error(f"Erreur générale: {str(e)}")
        return False


if __name__ == "__main__":
    print("Test des tables Supabase...")
    success = list_tables()
    print(f"Opération terminée.") 