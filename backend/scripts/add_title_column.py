#!/usr/bin/env python3
"""
Script pour ajouter la colonne 'title' à la table 'tasks' dans Supabase
et remplir automatiquement les valeurs existantes.
"""
import os
import sys
from pathlib import Path

# Ajouter le répertoire parent au path pour pouvoir importer les modules
parent_dir = str(Path(__file__).parent.parent)
sys.path.append(parent_dir)

from dotenv import load_dotenv
from services.supabase_service import supabase_service

# Chargement des variables d'environnement
load_dotenv()

async def add_title_column():
    """Ajoute la colonne title à la table tasks"""
    try:
        print("🚀 Ajout de la colonne 'title' à la table 'tasks'...")
        
        # SQL pour ajouter la colonne
        add_column_sql = """
        ALTER TABLE public.tasks 
        ADD COLUMN IF NOT EXISTS title TEXT;
        """
        
        # Exécuter la requête d'ajout de colonne
        await supabase_service.supabase.rpc('exec_sql', {'query': add_column_sql}).execute()
        print("✅ Colonne 'title' ajoutée avec succès")
        
        # SQL pour remplir les titles existants
        update_titles_sql = """
        UPDATE public.tasks 
        SET title = CASE 
            WHEN LENGTH(text) > 50 THEN LEFT(text, 50) || '...'
            ELSE text
        END
        WHERE title IS NULL OR title = '';
        """
        
        # Mettre à jour les tâches existantes
        await supabase_service.supabase.rpc('exec_sql', {'query': update_titles_sql}).execute()
        print("✅ Titles existants mis à jour automatiquement")
        
        # Vérifier le résultat
        tasks = await supabase_service.get_all_tasks()
        print(f"📊 Total des tâches dans la base: {len(tasks)}")
        
        if tasks:
            print("📝 Aperçu des tâches avec titles:")
            for i, task in enumerate(tasks[:3]):  # Afficher les 3 premières
                title = task.get('title', 'N/A')
                theme = task.get('theme', 'N/A')
                print(f"  {i+1}. [{theme}] {title}")
        
        print("🎉 Migration terminée avec succès !")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de l'ajout de la colonne: {str(e)}")
        return False

if __name__ == "__main__":
    import asyncio
    success = asyncio.run(add_title_column())
    sys.exit(0 if success else 1) 