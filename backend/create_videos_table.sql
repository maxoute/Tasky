-- Table pour la gestion des vidéos Orra Academy
-- À exécuter dans l'éditeur SQL de Supabase

-- Créer le type ENUM pour les statuts de vidéo
CREATE TYPE video_status AS ENUM ('a_tourner', 'a_monter', 'a_publier', 'publie');

-- Créer le type ENUM pour les priorités
CREATE TYPE video_priority AS ENUM ('low', 'medium', 'high');

-- Créer la table videos
CREATE TABLE IF NOT EXISTS videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    prompt TEXT,
    script TEXT,
    status video_status DEFAULT 'a_tourner',
    priority video_priority DEFAULT 'medium',
    category VARCHAR(100) DEFAULT 'Orra Academy',
    deadline DATE,
    
    -- Champs pour l'agent de recherche
    enriched_with_search BOOLEAN DEFAULT FALSE,
    research_data JSONB,
    search_keywords TEXT[],
    last_search_update TIMESTAMP WITH TIME ZONE,
    
    -- Métadonnées de production
    filming_date DATE,
    editing_date DATE,
    publish_date DATE,
    youtube_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    
    -- Statistiques (optionnel)
    estimated_duration INTEGER, -- en minutes
    actual_duration INTEGER, -- en minutes
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    
    -- Champs système
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Index et contraintes
    CONSTRAINT videos_title_check CHECK (char_length(title) >= 3),
    CONSTRAINT videos_duration_check CHECK (estimated_duration > 0 OR estimated_duration IS NULL)
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_videos_priority ON videos(priority);
CREATE INDEX IF NOT EXISTS idx_videos_deadline ON videos(deadline);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);
CREATE INDEX IF NOT EXISTS idx_videos_enriched ON videos(enriched_with_search);

-- Index pour la recherche full-text
CREATE INDEX IF NOT EXISTS idx_videos_search ON videos USING gin(to_tsvector('french', title || ' ' || coalesce(prompt, '') || ' ' || coalesce(script, '')));

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER videos_updated_at_trigger
    BEFORE UPDATE ON videos
    FOR EACH ROW
    EXECUTE FUNCTION update_videos_updated_at();

-- Fonction pour obtenir des statistiques sur les vidéos
CREATE OR REPLACE FUNCTION get_videos_stats()
RETURNS TABLE (
    total_videos INTEGER,
    videos_a_tourner INTEGER,
    videos_a_monter INTEGER,
    videos_a_publier INTEGER,
    videos_publiees INTEGER,
    videos_enriched INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_videos,
        COUNT(*) FILTER (WHERE status = 'a_tourner')::INTEGER as videos_a_tourner,
        COUNT(*) FILTER (WHERE status = 'a_monter')::INTEGER as videos_a_monter,
        COUNT(*) FILTER (WHERE status = 'a_publier')::INTEGER as videos_a_publier,
        COUNT(*) FILTER (WHERE status = 'publie')::INTEGER as videos_publiees,
        COUNT(*) FILTER (WHERE enriched_with_search = TRUE)::INTEGER as videos_enriched
    FROM videos;
END;
$$ LANGUAGE plpgsql;

-- Politique de sécurité RLS (Row Level Security)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Permettre la lecture pour tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to read videos" ON videos
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permettre l'insertion pour tous les utilisateurs authentifiés
CREATE POLICY "Allow authenticated users to insert videos" ON videos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permettre la mise à jour pour le créateur ou les admins
CREATE POLICY "Allow users to update their own videos" ON videos
    FOR UPDATE USING (auth.uid() = created_by OR auth.role() = 'service_role');

-- Permettre la suppression pour le créateur ou les admins
CREATE POLICY "Allow users to delete their own videos" ON videos
    FOR DELETE USING (auth.uid() = created_by OR auth.role() = 'service_role');

-- Insérer quelques données d'exemple
INSERT INTO videos (title, prompt, script, status, priority, category, deadline) VALUES
(
    'Introduction à N8N - Guide complet',
    'Créer un tutoriel complet sur N8N pour débutants',
    '# Script pour "Introduction à N8N - Guide complet"

## Introduction (0-30s)
Salut tout le monde ! Bienvenue sur Orra Academy. Aujourd''hui, on va découvrir N8N, l''outil d''automatisation no-code qui va révolutionner votre productivité.

## Corps principal (30s-3min)
- Point 1 : Qu''est-ce que N8N et pourquoi l''utiliser
- Point 2 : Installation et première configuration
- Point 3 : Créer votre premier workflow
- Point 4 : Connecter des services populaires
- Point 5 : Bonnes pratiques et astuces

## Call to action (3-3:30min)
Pour aller plus loin avec N8N, rejoignez notre formation complète sur orra-academy.com !

## Conclusion (3:30-4min)
À bientôt pour la prochaine vidéo sur Orra Academy !',
    'a_tourner',
    'high',
    'N8N Tutorial',
    CURRENT_DATE + INTERVAL '7 days'
),
(
    'Agents IA avec LangChain - Démonstration',
    'Montrer comment créer des agents IA intelligents avec LangChain',
    '# Script pour "Agents IA avec LangChain - Démonstration"

## Introduction (0-30s)
Salut ! Aujourd''hui on plonge dans l''univers des agents IA avec LangChain.

## Corps principal (30s-3min)
- Comprendre les agents IA
- Configuration de LangChain
- Créer un agent simple
- Exemples concrets d''utilisation

## Call to action
Découvrez notre formation complète sur l''IA sur orra-academy.com !',
    'a_monter',
    'medium',
    'IA Agents',
    CURRENT_DATE + INTERVAL '10 days'
),
(
    'Automatisation complète avec Python et N8N',
    'Combiner Python et N8N pour des automatisations avancées',
    NULL,
    'a_publier',
    'medium',
    'Automatisation',
    CURRENT_DATE + INTERVAL '3 days'
);

-- Afficher les statistiques
SELECT * FROM get_videos_stats(); 