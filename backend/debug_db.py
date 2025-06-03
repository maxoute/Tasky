import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.supabase_service import supabase_service

async def test_db():
    try:
        print("🔍 Test de connexion Supabase...")
        
        # Test récupération de toutes les tâches
        tasks = await supabase_service.get_all_tasks()
        print(f"✅ Nombre de tâches récupérées: {len(tasks)}")
        
        if tasks:
            print("\n📋 Première tâche:")
            print(tasks[0])
            
            print("\n📋 Toutes les tâches:")
            for i, task in enumerate(tasks, 1):
                completed_status = "✅ TERMINÉE" if task.get('completed') else "⏳ EN COURS"
                print(f"Tâche {i}: ID={task['id']}, {completed_status}, title={task.get('title')}, text={task['text'][:100]}...")
        
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_db()) 