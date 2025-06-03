import os
from dotenv import load_dotenv
from supabase import create_client
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Chargement manuel des variables d'environnement
load_dotenv()


def test_categories_table():
    try:
        # Récupérer les informations de connexion
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        if not url or not key:
            logger.error("Variables d'environnement manquantes: SUPABASE_URL ou SUPABASE_KEY")
            return False
            
        # Créer un client Supabase
        supabase = create_client(url, key)
        
        # Tester la connexion à la table categories
        print("Test de la table 'categories'...")
        response = supabase.table('categories').select('*').limit(5).execute()
        print(f"Succès! Nombre d'enregistrements: {len(response.data)}")
        
        # Essai d'insertion d'une catégorie de test
        print("\nTest d'insertion d'une catégorie...")
        test_category = {
            "user_id": "test_user",
            "name": "Test Catégorie"
        }
        
        insert_response = supabase.table('categories').insert(test_category).execute()
        print(f"Insertion réussie. Données: {insert_response.data}")
        
        # Récupérer à nouveau pour confirmer
        response = supabase.table('categories').select('*').eq("user_id", "test_user").execute()
        print(f"\nCatégories après insertion: {response.data}")
        
        return True
    except Exception as e:
        logger.error(f"Erreur: {str(e)}")
        return False


if __name__ == "__main__":
    print("Test de connexion à la table des catégories...")
    success = test_categories_table()
    print(f"Résultat global: {'Succès' if success else 'Échec'}") 