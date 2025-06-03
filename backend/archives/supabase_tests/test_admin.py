import os
from dotenv import load_dotenv
from supabase import create_client
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Chargement manuel des variables d'environnement
load_dotenv()


def test_with_service_key():
    """Utilise la clé de service pour contourner les restrictions RLS"""
    try:
        # Récupérer les informations de connexion
        url = os.getenv("SUPABASE_URL")
        service_key = os.getenv("SUPABASE_SERVICE_KEY")  # Utiliser la clé de service
        
        if not url or not service_key:
            logger.error("Variables d'environnement manquantes: SUPABASE_URL ou SUPABASE_SERVICE_KEY")
            return False
            
        print(f"URL Supabase: {url}")
        print(f"Utilisation de la clé de service pour l'authentification admin")
        
        # Créer un client Supabase avec la clé de service
        supabase = create_client(url, service_key)
        
        # 1. Tester la connexion aux tables
        print("\n1. Test de connexion aux tables...")
        
        tables = ['tasks', 'categories']
        for table in tables:
            try:
                response = supabase.table(table).select('*').limit(5).execute()
                print(f"  • Table '{table}': OK ({len(response.data)} enregistrements)")
            except Exception as e:
                print(f"  • Table '{table}': ERREUR ({str(e)})")
        
        # 2. Tester l'insertion dans categories
        print("\n2. Test d'insertion dans 'categories'...")
        test_category = {
            "user_id": "test_admin",
            "name": "Catégorie Test Admin"
        }
        
        try:
            insert_response = supabase.table('categories').insert(test_category).execute()
            print(f"  • Insertion réussie. ID: {insert_response.data[0]['id'] if insert_response.data else 'N/A'}")
        except Exception as e:
            print(f"  • Échec de l'insertion: {str(e)}")
        
        # 3. Tester l'insertion dans tasks
        print("\n3. Test d'insertion dans 'tasks'...")
        test_task = {
            "user_id": "test_admin",
            "theme": "Test Supabase",
            "text": "Vérifier la connexion à Supabase",
            "completed": False,
            "hashtags": ["test", "supabase"],
            "eisenhower": "important_not_urgent",
            "estimated_time": "30min"
        }
        
        try:
            insert_response = supabase.table('tasks').insert(test_task).execute()
            print(f"  • Insertion réussie. ID: {insert_response.data[0]['id'] if insert_response.data else 'N/A'}")
        except Exception as e:
            print(f"  • Échec de l'insertion: {str(e)}")
        
        # 4. Récupérer les données insérées
        print("\n4. Vérification des données insérées...")
        try:
            cat_response = supabase.table('categories').select('*').eq('user_id', 'test_admin').execute()
            task_response = supabase.table('tasks').select('*').eq('user_id', 'test_admin').execute()
            
            print(f"  • Catégories de test_admin: {len(cat_response.data)}")
            print(f"  • Tâches de test_admin: {len(task_response.data)}")
        except Exception as e:
            print(f"  • Erreur lors de la récupération: {str(e)}")
        
        return True
    except Exception as e:
        logger.error(f"Erreur générale: {str(e)}")
        return False


if __name__ == "__main__":
    print("=== TEST AVEC LA CLÉ DE SERVICE (ADMIN) ===")
    success = test_with_service_key()
    print("\nRésultat global: " + ("✅ SUCCÈS" if success else "❌ ÉCHEC")) 