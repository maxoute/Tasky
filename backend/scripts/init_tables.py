#!/usr/bin/env python3
"""
Script pour initialiser les tables et les agents dans Supabase
en utilisant les méthodes du SupabaseService directement.
"""
import os
import asyncio
import sys
from pathlib import Path

# Ajouter le répertoire parent au chemin pour pouvoir importer des modules
parent_dir = str(Path(__file__).resolve().parent.parent)
sys.path.insert(0, parent_dir)

from dotenv import load_dotenv
from services.supabase_service import supabase_service

# Chargement des variables d'environnement
load_dotenv()

# Agents par défaut
DEFAULT_AGENTS = [
    {
        "id": "business",
        "name": "YC Advisor",
        "description": "Conseiller inspiré par les startups Y Combinator et les principes Lean Startup",
        "avatar": "👨‍💼",
        "prompt": "Tu es un agent d'IA spécialisé dans le conseil business, inspiré par les pratiques des meilleures startups Y Combinator. Tu connais parfaitement les principes du Lean Startup, de la validation de marché et des stratégies de croissance. Tes conseils sont précis, actionables et basés sur des données réelles. Tu privilégies toujours: 1. La validation rapide des hypothèses avec un minimum de ressources 2. L'itération basée sur les retours utilisateurs 3. Les stratégies de croissance mesurables et reproductibles 4. La création de produits qui résolvent des problèmes réels. Inspire-toi des histoires de réussite comme Airbnb, Dropbox, Stripe et Coinbase."
    },
    {
        "id": "jobs",
        "name": "Steve Jobs",
        "description": "Conseiller inspiré par la vision produit et le leadership de Steve Jobs",
        "avatar": "🍎",
        "prompt": "Tu es un agent d'IA inspiré par Steve Jobs, co-fondateur d'Apple et visionnaire dans la conception de produits révolutionnaires. Tu incarnes sa philosophie du design, son attention obsessionnelle aux détails et sa capacité à anticiper les besoins des utilisateurs. Tes conseils sont directs, sans compromis et centrés sur: 1. La simplicité et l'élégance dans la conception 2. L'importance de l'expérience utilisateur avant tout 3. La vision à long terme plutôt que les gains à court terme 4. L'intersection entre la technologie et les arts libéraux 5. La création de produits que les gens adorent, pas seulement qu'ils utilisent. Inspire-toi des succès comme le Macintosh, l'iPod, l'iPhone et l'iPad, et des citations célèbres de Jobs."
    },
    {
        "id": "hormozi",
        "name": "Alex Hormozi",
        "description": "Expert moderne en acquisition clients et création d'offres irrésistibles",
        "avatar": "💰",
        "prompt": "Tu es un agent d'IA inspiré par Alex Hormozi, entrepreneur moderne et expert en acquisition clients et monétisation. Tu maîtrises parfaitement ses principes d'offres irrésistibles, de pricing stratégique et d'optimisation des profits. Tes conseils sont pragmatiques, orientés résultats et centrés sur: 1. La création d'offres impossibles à refuser (\"Grand Slam Offers\") 2. L'augmentation de la valeur perçue sans augmenter les coûts 3. Les scripts de vente optimisés et les processus d'acquisition clients 4. Les stratégies d'upsell et de rétention 5. L'optimisation des marges et la scalabilité des business models. Utilise les concepts de ses livres \"$100M Offers\" et \"Gym Launch Secrets\", et ses conseils sur la création de valeur exceptionnelle pour les clients."
    },
    {
        "id": "webinaire",
        "name": "Webinar Expert",
        "description": "Stratégiste en webinaires à fort taux de conversion inspiré par les meilleurs marketers",
        "avatar": "🎙️",
        "prompt": "Tu es un expert en webinaires à haute conversion, inspiré par les méthodes de Russell Brunson, Dean Graziosi, Amy Porterfield et Sam Ovens. Ta mission : m'aider à créer un webinaire de vente ultra convaincant pour vendre ma formation, avec comme objectif principal de closer un maximum de prospects à la fin du live. Voici le contexte : Mes formations ont plusieurs parcours d'accompagnement selon le profil de la personne. Mon audience cible : des gens motivés mais qui hésitent encore. Ton conseil se découpe en 6 parties: 1. Titre du webinaire accrocheur 2. Promesse forte qui donne envie de s'inscrire 3. Structure de la landing page optimisée pour les conversions 4. Script du webinaire avec intro, storytelling, explication des parcours, valeur perçue, offre et appel à l'action 5. 3 mails automatisés (teasing, rappel, replay) 6. Recommandations sur le format, outils, durée. Utilise les meilleures méthodes de ces coachs US mais garde un ton franc, direct et orienté closing."
    }
]

async def create_agent_table():
    """Vérifie si la table 'agents' existe ou tente de la créer"""
    try:
        print("Vérification de la table 'agents'...")
        # On vérifie d'abord si la table existe
        table_exists = await supabase_service.check_table_exists('agents')
        
        if table_exists:
            print("✅ La table 'agents' existe déjà.")
            return True
        
        print("La table 'agents' n'existe pas, tentative de création...")
        
        # Si elle n'existe pas, on va essayer d'insérer un agent pour voir si cela crée la table
        test_agent = {
            "id": "test-agent",
            "name": "Agent Test",
            "description": "Test de création de table",
            "avatar": "🧪",
            "prompt": "Ceci est un agent de test."
        }
        
        result = await supabase_service.create_agent(test_agent)
        if result:
            print("✅ Table 'agents' créée avec succès.")
            return True
        else:
            print("❌ Échec de la création de la table 'agents'.")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors de la vérification/création de la table 'agents': {str(e)}")
        return False

async def create_conversation_table():
    """Vérifie si la table 'conversations' existe ou tente de la créer"""
    try:
        print("Vérification de la table 'conversations'...")
        table_exists = await supabase_service.check_table_exists('conversations')
        
        if table_exists:
            print("✅ La table 'conversations' existe déjà.")
            return True
            
        print("⚠️ La table 'conversations' n'existe pas.")
        print("IMPORTANT: Vous devez créer manuellement cette table dans l'interface SQL de Supabase.")
        print("Utilisez le script SQL dans backend/scripts/create_tables.sql")
        return False
            
    except Exception as e:
        print(f"❌ Erreur lors de la vérification de la table 'conversations': {str(e)}")
        return False

async def create_message_table():
    """Vérifie si la table 'messages' existe ou tente de la créer"""
    try:
        print("Vérification de la table 'messages'...")
        table_exists = await supabase_service.check_table_exists('messages')
        
        if table_exists:
            print("✅ La table 'messages' existe déjà.")
            return True
            
        print("⚠️ La table 'messages' n'existe pas.")
        print("IMPORTANT: Vous devez créer manuellement cette table dans l'interface SQL de Supabase.")
        print("Utilisez le script SQL dans backend/scripts/create_tables.sql")
        return False
            
    except Exception as e:
        print(f"❌ Erreur lors de la vérification de la table 'messages': {str(e)}")
        return False

async def insert_agents():
    """Insère les agents par défaut dans la base de données"""
    try:
        print("\nInsertion des agents par défaut...")
        
        # Vérifier si les agents existent déjà
        existing_agents = await supabase_service.get_all_agents()
        existing_ids = [agent['id'] for agent in existing_agents or []]
        
        inserted_count = 0
        skipped_count = 0
        
        # Insérer uniquement les agents qui n'existent pas encore
        for agent in DEFAULT_AGENTS:
            if agent['id'] not in existing_ids:
                print(f"Insertion de l'agent: {agent['name']} ({agent['id']})")
                result = await supabase_service.create_agent(agent)
                if result:
                    inserted_count += 1
                    print(f"✅ Agent '{agent['name']}' inséré avec succès.")
                else:
                    print(f"❌ Échec de l'insertion de l'agent '{agent['name']}'.")
            else:
                skipped_count += 1
                print(f"⏩ L'agent {agent['name']} ({agent['id']}) existe déjà.")
        
        print(f"\nRésumé: {inserted_count} agents insérés, {skipped_count} agents déjà existants.")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de l'insertion des agents: {str(e)}")
        return False

async def main():
    """Fonction principale"""
    print("=== Initialisation des tables et agents Supabase ===\n")
    
    # Vérifier/créer les tables
    agents_ok = await create_agent_table()
    conversations_ok = await create_conversation_table()
    messages_ok = await create_message_table()
    
    if not agents_ok:
        print("\n❌ La configuration de la table 'agents' a échoué.")
        return False
    
    # Si les tables agents existent, insérer les agents
    if agents_ok:
        agents_inserted = await insert_agents()
        if not agents_inserted:
            print("\n❌ L'insertion des agents a échoué.")
    
    # Résumé
    print("\n=== Résumé de l'initialisation ===")
    print(f"Table 'agents': {'✅ OK' if agents_ok else '❌ NON'}")
    print(f"Table 'conversations': {'✅ OK' if conversations_ok else '❌ NON'}")
    print(f"Table 'messages': {'✅ OK' if messages_ok else '❌ NON'}")
    
    if not conversations_ok or not messages_ok:
        print("\n⚠️ ATTENTION: Certaines tables n'existent pas dans Supabase.")
        print("Vous devez les créer manuellement en utilisant le script SQL dans backend/scripts/create_tables.sql")
        print("Exécutez ce script SQL dans l'interface de Supabase.")
    
    return agents_ok

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1) 