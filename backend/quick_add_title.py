#!/usr/bin/env python3
import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

def add_title_column():
    try:
        # Utiliser la clé de service pour avoir les permissions admin
        supabase = create_client(
            os.getenv('SUPABASE_URL'), 
            os.getenv('SUPABASE_SERVICE_KEY')
        )
        
        print("🚀 Test de connexion...")
        
        # Tester la connexion en récupérant les tâches existantes
        response = supabase.table('tasks').select('*').limit(3).execute()
        print(f"✅ Connexion OK - {len(response.data)} tâche(s) trouvée(s)")
        
        # Afficher la structure actuelle
        if response.data:
            task = response.data[0]
            columns = list(task.keys())
            print(f"📋 Colonnes actuelles: {columns}")
            
            if 'title' in columns:
                print("✅ La colonne 'title' existe déjà !")
                return True
            else:
                print("❌ La colonne 'title' n'existe pas")
                print("💡 Ajoute-la manuellement via l'interface Supabase :")
                print("   1. Va sur https://supabase.com/dashboard")
                print("   2. Ouvre SQL Editor")
                print("   3. Exécute: ALTER TABLE public.tasks ADD COLUMN title TEXT;")
                return False
        else:
            print("ℹ️ Aucune tâche trouvée dans la table")
            return False
            
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        return False

if __name__ == "__main__":
    success = add_title_column()
    sys.exit(0 if success else 1) 