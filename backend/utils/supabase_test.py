"""
Utilitaire pour tester la connexion et les fonctionnalités Supabase.
Ce module combine les fonctionnalités des différents scripts de test temporaires
en un seul outil de diagnostic.
"""
import os
import argparse
from dotenv import load_dotenv
from supabase import create_client
import logging
from typing import List, Dict, Any, Optional, Tuple

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Chargement des variables d'environnement
load_dotenv()


class SupabaseTest:
    """Classe pour tester la connexion et les fonctionnalités Supabase"""
    
    def __init__(self, use_service_key: bool = False):
        """
        Initialise le testeur Supabase
        Args:
            use_service_key: Si True, utilise la clé de service au lieu de la clé anonyme
        """
        self.url = os.environ.get("SUPABASE_URL")
        
        if use_service_key:
            self.key = os.environ.get("SUPABASE_SERVICE_KEY")
            self.key_type = "service"
        else:
            self.key = os.environ.get("SUPABASE_KEY")
            self.key_type = "anonyme"
            
        if not self.url or not self.key:
            raise ValueError(
                f"Variables d'environnement manquantes: SUPABASE_URL ou "
                f"{'SUPABASE_SERVICE_KEY' if use_service_key else 'SUPABASE_KEY'}"
            )
            
        self.supabase = create_client(self.url, self.key)
        logger.info(f"Client Supabase initialisé avec la clé {self.key_type}")
    
    def test_connection(self) -> bool:
        """Teste la connexion de base à Supabase"""
        try:
            logger.info(f"Test de connexion avec la clé {self.key_type}...")
            # Tester avec une requête simple à une table connue
            self.supabase.table('tasks').select('*').limit(1).execute()
            logger.info(f"Connexion réussie à {self.url}")
            return True
        except Exception as e:
            logger.error(f"Échec de connexion: {str(e)}")
            return False
    
    def list_tables(self) -> List[Tuple[str, bool, int]]:
        """
        Tente de lister et accéder aux tables communes
        Returns:
            Liste de tuples (nom_table, existe, nombre_enregistrements)
        """
        results = []
        tables = ['tasks', 'categories', 'users', 'profiles']
        
        for table in tables:
            try:
                response = self.supabase.table(table).select('*').limit(5).execute()
                results.append((table, True, len(response.data)))
                logger.info(f"Table '{table}' accessible ({len(response.data)} enregistrements)")
            except Exception as e:
                results.append((table, False, 0))
                logger.error(f"Table '{table}' inaccessible: {str(e)}")
                
        return results
    
    def create_test_data(self) -> Dict[str, Any]:
        """
        Crée des données de test dans Supabase
        Returns:
            Dictionnaire avec les résultats des insertions
        """
        results = {"category": None, "task": None}
        
        # Créer une catégorie de test
        try:
            test_category = {
                "user_id": "test_user",
                "name": "Catégorie de Test"
            }
            cat_response = self.supabase.table('categories').insert(test_category).execute()
            results["category"] = cat_response.data[0] if cat_response.data else None
            logger.info(f"Catégorie créée: {results['category']}")
        except Exception as e:
            logger.error(f"Erreur lors de la création de la catégorie: {str(e)}")
        
        # Créer une tâche de test
        try:
            test_task = {
                "user_id": "test_user",
                "theme": "Test Supabase",
                "text": "Tester la connexion à Supabase",
                "completed": False,
                "hashtags": ["test", "setup"],
                "eisenhower": "important_not_urgent",
                "estimated_time": "15min"
            }
            task_response = self.supabase.table('tasks').insert(test_task).execute()
            results["task"] = task_response.data[0] if task_response.data else None
            logger.info(f"Tâche créée: {results['task']}")
        except Exception as e:
            logger.error(f"Erreur lors de la création de la tâche: {str(e)}")
            
        return results
    
    def check_rls_policies(self) -> Dict[str, bool]:
        """
        Vérifie si les politiques RLS fonctionnent correctement.
        Cette méthode est plus pertinente avec une clé anonyme.
        
        Returns:
            Dictionnaire avec les résultats des tests RLS
        """
        # Ce test n'est pas exhaustif et pourrait être amélioré
        results = {}
        
        if self.key_type == "service":
            logger.warning("Vérification RLS avec clé de service - les résultats peuvent être trompeurs")
            
        # Tester l'insertion sans user_id (devrait échouer avec RLS actif)
        try:
            invalid_category = {"name": "Test Sans User ID"}
            self.supabase.table('categories').insert(invalid_category).execute()
            results["rls_categories"] = False  # RLS n'est pas actif
            logger.warning("RLS n'est pas actif sur la table 'categories' (insertion sans user_id a réussi)")
        except Exception:
            results["rls_categories"] = True  # RLS est actif
            logger.info("RLS est actif sur la table 'categories' (✓)")
        
        # Tester sur la table tasks aussi
        try:
            invalid_task = {"theme": "Test", "text": "Test Sans User ID"}
            self.supabase.table('tasks').insert(invalid_task).execute()
            results["rls_tasks"] = False  # RLS n'est pas actif
            logger.warning("RLS n'est pas actif sur la table 'tasks' (insertion sans user_id a réussi)")
        except Exception:
            results["rls_tasks"] = True  # RLS est actif
            logger.info("RLS est actif sur la table 'tasks' (✓)")
            
        return results


def main():
    """Fonction principale pour exécution en ligne de commande"""
    parser = argparse.ArgumentParser(description='Utilitaire de test Supabase')
    parser.add_argument(
        '--admin', '-a', action='store_true',
        help='Utiliser la clé de service (admin) au lieu de la clé anonyme'
    )
    parser.add_argument(
        '--create-data', '-c', action='store_true',
        help='Créer des données de test dans Supabase'
    )
    parser.add_argument(
        '--check-rls', '-r', action='store_true',
        help='Vérifier les politiques RLS'
    )
    
    args = parser.parse_args()
    
    try:
        tester = SupabaseTest(use_service_key=args.admin)
        
        # Test de base de la connexion
        if tester.test_connection():
            print("\n✅ Connexion à Supabase établie avec succès")
        else:
            print("\n❌ Échec de connexion à Supabase")
            return
        
        # Lister les tables
        print("\n📋 Tables disponibles:")
        tables = tester.list_tables()
        for name, exists, count in tables:
            status = "✅" if exists else "❌"
            print(f"  {status} {name}: {count if exists else 'N/A'} enregistrements")
        
        # Création de données de test si demandé
        if args.create_data:
            print("\n🔧 Création de données de test:")
            results = tester.create_test_data()
            
            if results["category"]:
                print(f"  ✅ Catégorie créée (ID: {results['category'].get('id')})")
            else:
                print("  ❌ Échec de création de catégorie")
                
            if results["task"]:
                print(f"  ✅ Tâche créée (ID: {results['task'].get('id')})")
            else:
                print("  ❌ Échec de création de tâche")
        
        # Vérification des politiques RLS si demandé
        if args.check_rls:
            print("\n🔒 Vérification des politiques RLS:")
            rls_results = tester.check_rls_policies()
            
            for table, is_active in rls_results.items():
                status = "✅ Active" if is_active else "❌ Inactive"
                print(f"  {status} sur {table}")
                
            if not any(rls_results.values()):
                print("\n⚠️  Aucune politique RLS active. Pour activer RLS:")
                print("  1. Allez sur https://app.supabase.com et sélectionnez votre projet")
                print("  2. Allez dans 'Table Editor'")
                print("  3. Pour chaque table, allez dans 'Policies'")
                print("  4. Activez 'Row Level Security'")
                
    except Exception as e:
        logger.error(f"Erreur lors des tests: {str(e)}")
        print(f"\n❌ Erreur: {str(e)}")


if __name__ == "__main__":
    print("=== UTILITAIRE DE TEST SUPABASE ===")
    main()
    print("\nTerniné. Pour plus d'options, utilisez --help") 