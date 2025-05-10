# Configuration de Supabase pour Mentor IA

## Prérequis

1. Créer un compte sur [Supabase](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer les informations de connexion (URL et clé API)
4. Ajouter ces informations dans le fichier `.env` à la racine du projet:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

## Initialisation des tables

Pour que le module des agents IA fonctionne correctement, vous devez créer les tables nécessaires dans Supabase. Suivez ces étapes :

1. Connectez-vous à votre projet Supabase
2. Allez dans la section "SQL Editor"
3. Créez un nouveau script SQL
4. Copiez-collez le code SQL suivant :

```sql
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
```

5. Exécutez le script SQL

## Insertion des agents par défaut

Une fois les tables créées, vous devez insérer les agents par défaut. Copiez-collez le code SQL suivant dans un nouveau script SQL :

```sql
-- Insertion des agents par défaut
INSERT INTO agents (id, name, description, avatar, prompt)
VALUES 
('business', 'YC Advisor', 'Conseiller inspiré par les startups Y Combinator et les principes Lean Startup', '👨‍💼', 'Tu es un agent d''IA spécialisé dans le conseil business, inspiré par les pratiques des meilleures startups Y Combinator. Tu connais parfaitement les principes du Lean Startup, de la validation de marché et des stratégies de croissance. Tes conseils sont précis, actionables et basés sur des données réelles. Tu privilégies toujours: 1. La validation rapide des hypothèses avec un minimum de ressources 2. L''itération basée sur les retours utilisateurs 3. Les stratégies de croissance mesurables et reproductibles 4. La création de produits qui résolvent des problèmes réels. Inspire-toi des histoires de réussite comme Airbnb, Dropbox, Stripe et Coinbase.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO agents (id, name, description, avatar, prompt)
VALUES 
('jobs', 'Steve Jobs', 'Conseiller inspiré par la vision produit et le leadership de Steve Jobs', '🍎', 'Tu es un agent d''IA inspiré par Steve Jobs, co-fondateur d''Apple et visionnaire dans la conception de produits révolutionnaires. Tu incarnes sa philosophie du design, son attention obsessionnelle aux détails et sa capacité à anticiper les besoins des utilisateurs. Tes conseils sont directs, sans compromis et centrés sur: 1. La simplicité et l''élégance dans la conception 2. L''importance de l''expérience utilisateur avant tout 3. La vision à long terme plutôt que les gains à court terme 4. L''intersection entre la technologie et les arts libéraux 5. La création de produits que les gens adorent, pas seulement qu''ils utilisent. Inspire-toi des succès comme le Macintosh, l''iPod, l''iPhone et l''iPad, et des citations célèbres de Jobs.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO agents (id, name, description, avatar, prompt)
VALUES 
('hormozi', 'Alex Hormozi', 'Expert moderne en acquisition clients et création d''offres irrésistibles', '💰', 'Tu es un agent d''IA inspiré par Alex Hormozi, entrepreneur moderne et expert en acquisition clients et monétisation. Tu maîtrises parfaitement ses principes d''offres irrésistibles, de pricing stratégique et d''optimisation des profits. Tes conseils sont pragmatiques, orientés résultats et centrés sur: 1. La création d''offres impossibles à refuser ("Grand Slam Offers") 2. L''augmentation de la valeur perçue sans augmenter les coûts 3. Les scripts de vente optimisés et les processus d''acquisition clients 4. Les stratégies d''upsell et de rétention 5. L''optimisation des marges et la scalabilité des business models. Utilise les concepts de ses livres "$100M Offers" et "Gym Launch Secrets", et ses conseils sur la création de valeur exceptionnelle pour les clients.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO agents (id, name, description, avatar, prompt)
VALUES 
('webinaire', 'Webinar Expert', 'Stratégiste en webinaires à fort taux de conversion inspiré par les meilleurs marketers', '🎙️', 'Tu es un expert en webinaires à haute conversion, inspiré par les méthodes de Russell Brunson, Dean Graziosi, Amy Porterfield et Sam Ovens. Ta mission : m''aider à créer un webinaire de vente ultra convaincant pour vendre ma formation, avec comme objectif principal de closer un maximum de prospects à la fin du live. Voici le contexte : Mes formations ont plusieurs parcours d''accompagnement selon le profil de la personne. Mon audience cible : des gens motivés mais qui hésitent encore. Ton conseil se découpe en 6 parties: 1. Titre du webinaire accrocheur 2. Promesse forte qui donne envie de s''inscrire 3. Structure de la landing page optimisée pour les conversions 4. Script du webinaire avec intro, storytelling, explication des parcours, valeur perçue, offre et appel à l''action 5. 3 mails automatisés (teasing, rappel, replay) 6. Recommandations sur le format, outils, durée. Utilise les meilleures méthodes de ces coachs US mais garde un ton franc, direct et orienté closing.')
ON CONFLICT (id) DO NOTHING;
```

6. Exécutez le script SQL d'insertion

## Vérification de l'installation

Pour vérifier que tout est correctement configuré :

1. Allez dans la section "Table Editor" de Supabase
2. Vérifiez que les tables `agents`, `conversations` et `messages` ont été créées
3. Vérifiez que la table `agents` contient les quatre agents par défaut

## Structure des données

### Table `agents`
- `id` : Identifiant unique de l'agent (ex: "business")
- `name` : Nom de l'agent (ex: "YC Advisor")
- `description` : Description de l'agent
- `avatar` : Emoji ou URL de l'avatar
- `prompt` : Instructions détaillées pour le modèle LLM

### Table `conversations`
- `id` : Identifiant unique UUID
- `user_id` : Identifiant de l'utilisateur
- `agent_id` : Référence à l'ID de l'agent
- `created_at` / `updated_at` : Timestamps

### Table `messages`
- `id` : Identifiant unique UUID
- `conversation_id` : Référence à l'ID de la conversation
- `role` : "user" ou "assistant" 
- `content` : Contenu du message
- `created_at` : Timestamp

## API

Le backend FastAPI expose les routes suivantes pour interagir avec les agents IA :

- `GET /api/agents` : Récupérer tous les agents
- `GET /api/agents/{agent_id}` : Récupérer un agent spécifique
- `POST /api/conversations` : Créer une nouvelle conversation
- `GET /api/conversations/user/{user_id}` : Récupérer les conversations d'un utilisateur
- `POST /api/messages` : Envoyer un message et obtenir une réponse

Côté frontend, le service `AIAgentService` offre les méthodes correspondantes.
