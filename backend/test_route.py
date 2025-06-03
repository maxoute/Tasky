import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.supabase_service import supabase_service

async def test_route():
    try:
        print("🧪 Test de la route GET /tasks...")
        
        # Reproduire exactement ce qui se passe dans la route
        print("1. Appel supabase_service.get_all_tasks()...")
        tasks = await supabase_service.get_all_tasks()
        print(f"✅ Récupéré {len(tasks)} tâches")
        
        print("2. Création de la réponse JSON...")
        response = {"tasks": tasks}
        print(f"✅ Response type: {type(response)}")
        
        print("3. Vérification de la sérialisation JSON...")
        import json
        json_str = json.dumps(response, default=str)
        print(f"✅ JSON serializable: {len(json_str)} caractères")
        
        print("\n🎉 Test réussi ! La route devrait fonctionner.")
        
    except Exception as e:
        print(f"❌ Erreur dans le test: {str(e)}")
        import traceback
        traceback.print_exc()

async def test_update():
    try:
        print("🧪 Test de mise à jour d'une tâche...")
        
        # Récupérer une tâche
        task_id = 7  # La première tâche
        print(f"🔍 Récupération de la tâche {task_id}...")
        task = await supabase_service.get_task_by_id(task_id)
        if task:
            print(f"✅ Tâche trouvée: completed = {task.get('completed')}")
        else:
            print(f"❌ Tâche {task_id} non trouvée")
            return
        
        # Mettre à jour completed = True
        print(f"🔄 Mise à jour completed = True pour tâche {task_id}...")
        updated_task = await supabase_service.update_task_by_id(task_id, {"completed": True})
        
        if updated_task:
            print(f"✅ Mise à jour réussie: completed = {updated_task.get('completed')}")
        else:
            print("❌ Échec de la mise à jour")
            
        # Vérifier en relisant
        print(f"🔍 Vérification en relisant la tâche...")
        updated_task_check = await supabase_service.get_task_by_id(task_id)
        if updated_task_check:
            print(f"✅ Vérification: completed = {updated_task_check.get('completed')}")
        
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_route())
    asyncio.run(test_update()) 