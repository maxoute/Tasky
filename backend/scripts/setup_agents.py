#!/usr/bin/env python3
"""
Script pour initialiser les agents par défaut dans Supabase.
Ce script vérifie si la table 'agents' existe, la crée si nécessaire, 
puis insère les agents par défaut.
"""

import asyncio
import sys
from pathlib import Path
from dotenv import load_dotenv

# Ajouter le répertoire parent au path pour pouvoir importer les modules
parent_dir = str(Path(__file__).parent.parent)
sys.path.append(parent_dir)

from services.supabase_service import supabase_service


# Définition des agents par défaut
DEFAULT_AGENTS = [
    {
        "id": "webinar-expert",
        "name": "Expert Webinar",
        "description": "Un expert en création et animation de webinaires professionnels",
        "avatar": "👨‍💼",
        "prompt": "Tu es un expert en création et animation de webinaires professionnels. Tu aides à planifier, structurer et animer des webinaires efficaces. Tu donnes des conseils sur la préparation, la technique, l'engagement de l'audience et le suivi post-webinaire."
    },
    {
        "id": "fitness-coach",
        "name": "Coach Fitness",
        "description": "Un coach de fitness personnel qui aide à atteindre vos objectifs de santé et de forme",
        "avatar": "💪",
        "prompt": "Tu es un coach de fitness personnel qui aide à créer des programmes d'entraînement personnalisés. Tu donnes des conseils sur les exercices, la nutrition, la récupération et la motivation. Tu adaptes tes recommandations en fonction des objectifs, du niveau et des contraintes de chacun."
    },
    {
        "id": "career-mentor",
        "name": "Mentor de Carrière",
        "description": "Un conseiller en développement de carrière qui aide à progresser professionnellement",
        "avatar": "🚀",
        "prompt": "Tu es un mentor de carrière expérimenté qui aide à définir et atteindre des objectifs professionnels. Tu offres des conseils sur le développement de compétences, la recherche d'emploi, les entretiens, la négociation salariale et l'évolution de carrière. Tu aides à identifier les forces, les faiblesses et les opportunités."
    }
]


async def create_agent_table():
    """Vérifie si la table 'agents' existe et la crée si nécessaire"""
    try:
        # Vérifier si la table existe
        table_exists = await supabase_service.check_table_exists('agents')
        
        if not table_exists:
            print("La table 'agents' n'existe pas. Création de la table...")
            # Pour créer la table, nous allons simplement insérer un agent test puis le supprimer
            # Cela forcera Supabase à créer la table avec le bon schéma
            test_agent = {
                "id": "test-agent",
                "name": "Agent Test",
                "description": "Agent temporaire pour la création de la table",
                "avatar": "🧪",
                "prompt": "Ceci est un agent test."
            }
            
            # Insérer l'agent test
            await supabase_service.create_agent(test_agent)
            print("Table 'agents' créée avec succès.")
            
            # Supprimer l'agent test - cette partie est optionnelle
            # Nous pourrions implémenter une méthode delete_agent dans le service Supabase
        else:
            print("La table 'agents' existe déjà.")
        
        return True
    except Exception as e:
        print(f"Erreur lors de la création de la table 'agents': {str(e)}")
        return False



async def insert_agents():
    """Insère les agents par défaut dans la base de données"""
    try:
        print("Insertion des agents par défaut...")
        for agent in DEFAULT_AGENTS:
            # Vérifier si l'agent existe déjà
            existing_agent = await supabase_service.get_agent_by_id(agent["id"])
            
            if existing_agent:
                print(f"L'agent '{agent['name']}' existe déjà.")
            else:
                # Insérer l'agent
                result = await supabase_service.create_agent(agent)
                if result:
                    print(f"Agent '{agent['name']}' inséré avec succès.")
                else:
                    print(f"Échec de l'insertion de l'agent '{agent['name']}'.")
        
        return True
    except Exception as e:
        print(f"Erreur lors de l'insertion des agents: {str(e)}")
        return False



async def main():
    """Fonction principale qui initialise les agents"""
    print("Initialisation des agents...")
    
    # Charger les variables d'environnement
    load_dotenv()
    
    # Créer la table si nécessaire
    table_created = await create_agent_table()
    if not table_created:
        print("Impossible de créer la table 'agents'. Arrêt du script.")
        return False
    
    # Insérer les agents par défaut
    agents_inserted = await insert_agents()
    if not agents_inserted:
        print("Erreur lors de l'insertion des agents par défaut.")
        return False
    
    print("Initialisation des agents terminée avec succès.")
    return True


if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)