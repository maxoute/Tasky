import os
from dotenv import load_dotenv
from supabase import create_client
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Chargement manuel des variables d'environnement
load_dotenv()


def execute_sql():
    try:
        # Récupérer les informations de connexion (clé de service requise)
        url = os.getenv("SUPABASE_URL")
        service_key = os.getenv("SUPABASE_SERVICE_KEY")  # Utiliser la clé de service pour les opérations système
        
        if not url or not service_key:
            logger.error("Variables d'environnement manquantes: SUPABASE_URL ou SUPABASE_SERVICE_KEY")
            return False
            
        # Créer un client Supabase avec la clé de service
        supabase = create_client(url, service_key)
        
        # Désactiver temporairement RLS pour le test
        print("Tentative de modification des politiques RLS (à des fins de test uniquement)...")
        
        try:
            # Cette API RPC doit être définie dans Supabase pour fonctionner
            # Vous pouvez également aller dans l'interface Supabase et désactiver RLS manuellement
            result = supabase.rpc('disable_rls_for_testing', {}).execute()
            print(f"Résultat RPC: {result.data}")
        except Exception as e:
            print(f"Impossible de désactiver RLS via RPC: {str(e)}")
            print("Veuillez désactiver RLS manuellement dans l'interface Supabase pour tester:")
            print("1. Allez sur https://app.supabase.com")
            print("2. Sélectionnez votre projet")
            print("3. Allez dans 'Table Editor'")
            print("4. Pour chaque table, allez dans 'Policies'")
            print("5. Désactivez Row Level Security (pour les tests uniquement)")
        
        # Tester l'insertion après avoir désactivé RLS manuellement
        print("\nUne fois RLS désactivé, exécutez 'python test_categories.py' à nouveau.")
        return True
    except Exception as e:
        logger.error(f"Erreur: {str(e)}")
        return False


if __name__ == "__main__":
    print("ATTENTION: Script pour désactiver temporairement la sécurité. Utilisez UNIQUEMENT en développement.")
    execute_sql()
    print("\nNote: En production, vous devez implémenter l'authentification correctement.") 