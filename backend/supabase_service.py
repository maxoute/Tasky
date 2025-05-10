"""
Service pour gérer les interactions avec Supabase.
Ce module fournit des fonctions pour interagir avec les tables Supabase.
"""
from supabase import create_client
import os
from dotenv import load_dotenv
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Chargement des variables d'environnement
load_dotenv()

# Récupération des informations de connexion Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Création du client Supabase
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
supabase_admin = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def get_user_tasks(user_id):
    """Récupère les tâches d'un utilisateur spécifique"""
    try:
        response = supabase.table("tasks").select("*").eq("user_id", user_id).execute()
        return response.data
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des tâches: {e}")
        return []


def add_task(task_data):
    """Ajoute une nouvelle tâche"""
    try:
        response = supabase.table("tasks").insert(task_data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        logger.error(f"Erreur lors de l'ajout d'une tâche: {e}")
        return None


def update_task(task_id, task_data):
    """Met à jour une tâche existante"""
    try:
        response = supabase.table("tasks").update(task_data).eq("id", task_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour d'une tâche: {e}")
        return None


def delete_task(task_id):
    """Supprime une tâche"""
    try:
        supabase.table("tasks").delete().eq("id", task_id).execute()
        return True
    except Exception as e:
        logger.error(f"Erreur lors de la suppression d'une tâche: {e}")
        return False


def get_user_categories(user_id):
    """Récupère les catégories d'un utilisateur spécifique"""
    try:
        response = supabase.table("categories").select("*").eq("user_id", user_id).execute()
        return response.data
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des catégories: {e}")
        return []


def add_category(category_data):
    """Ajoute une nouvelle catégorie"""
    try:
        response = supabase.table("categories").insert(category_data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        logger.error(f"Erreur lors de l'ajout d'une catégorie: {e}")
        return None


def delete_category(category_id):
    """Supprime une catégorie"""
    try:
        supabase.table("categories").delete().eq("id", category_id).execute()
        return True
    except Exception as e:
        logger.error(f"Erreur lors de la suppression d'une catégorie: {e}")
        return False


# Fonctions administratives utilisant la clé de service
def admin_create_table(table_definition):
    """Fonction administrative pour créer une table (nécessite la clé de service)"""
    try:
        # Cette fonction est un exemple et n'est pas directement supportée par l'API Supabase
        # En pratique, vous devez créer les tables via l'interface Supabase ou des migrations SQL
        logger.warning("Création de tables via l'API n'est pas supportée. Utilisez l'interface Supabase.")
        return False
    except Exception as e:
        logger.error(f"Erreur lors de la création de table: {e}")
        return False 