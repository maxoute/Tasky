"""
Script pour configurer les tables Supabase et insérer les agents par défaut.
"""
import os
import asyncio
import sys
from pathlib import Path

# Ajouter le répertoire parent au chemin pour pouvoir importer des modules
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv
from services.supabase_service import supabase_service

# Chargement des variables d'environnement
load_dotenv()

# Requêtes SQL pour créer les tables
CREATE_TABLES_SQL = """
-- Table des agents IA
CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    avatar TEXT NOT NULL,
    prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    agent_id TEXT REFERENCES agents(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Fonction pour mettre à jour le timestamp automatiquement
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour le timestamp automatiquement
CREATE TRIGGER update_agents_updated_at
BEFORE UPDATE ON agents
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();
"""

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

async def create_tables():
    """Crée les tables dans Supabase"""
    try:
        print("Création des tables dans Supabase...")
        # Exécuter les requêtes SQL pour créer les tables
        await supabase_service.supabase.rpc('exec_sql', {'query': CREATE_TABLES_SQL}).execute()
        print("Tables créées avec succès !")
        return True
    except Exception as e:
        print(f"Erreur lors de la création des tables: {str(e)}")
        return False

async def create_agents():
    """Insère les agents par défaut dans Supabase"""
    try:
        print("Insertion des agents par défaut...")
        
        # Vérifier si les agents existent déjà
        existing_agents = await supabase_service.get_all_agents()
        existing_ids = [agent['id'] for agent in existing_agents]
        
        # Insérer uniquement les agents qui n'existent pas encore
        for agent in DEFAULT_AGENTS:
            if agent['id'] not in existing_ids:
                print(f"Insertion de l'agent: {agent['name']} ({agent['id']})")
                await supabase_service.create_agent(agent)
            else:
                print(f"L'agent {agent['name']} ({agent['id']}) existe déjà")
        
        print("Agents insérés avec succès !")
        return True
    except Exception as e:
        print(f"Erreur lors de l'insertion des agents: {str(e)}")
        return False

async def main():
    """Fonction principale"""
    print("Initialisation de la base de données Supabase...")
    
    # Créer les tables
    tables_created = await create_tables()
    if not tables_created:
        print("Erreur: Impossible de créer les tables.")
        return False
    
    # Insérer les agents
    agents_created = await create_agents()
    if not agents_created:
        print("Erreur: Impossible d'insérer les agents.")
        return False
    
    print("Base de données initialisée avec succès !")
    return True

# Exécuter le script
if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(0 if result else 1) 