-- Tables pour les nouvelles fonctionnalités

-- Amélioration de la table tasks existante
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS category_id BIGINT;

-- Table pour les habitudes
CREATE TABLE IF NOT EXISTS public.habits (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    frequency TEXT NOT NULL, -- 'daily', 'weekly', etc.
    color TEXT,
    icon TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table pour suivre les jours où une habitude a été complétée
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id BIGSERIAL PRIMARY KEY,
    habit_id BIGINT REFERENCES public.habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completed BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Créer un index sur habit_id et date pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id_date ON public.habit_logs(habit_id, date);

-- Table pour les catégories prédéfinies
CREATE TABLE IF NOT EXISTS public.category_presets (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT,
    icon TEXT,
    is_system BOOLEAN DEFAULT false, -- Si true, c'est une catégorie système non modifiable
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insérer quelques catégories prédéfinies
INSERT INTO public.category_presets (name, color, icon, is_system)
VALUES
    ('Travail', '#0052cc', 'work', true),
    ('Personnel', '#36b37e', 'person', true),
    ('Santé', '#ff5630', 'favorite', true),
    ('Finances', '#00875a', 'payments', true),
    ('Éducation', '#6554c0', 'school', true),
    ('Loisirs', '#00b8d9', 'sports_esports', true),
    ('Famille', '#6b778c', 'family_restroom', true)
ON CONFLICT DO NOTHING;

-- Table pour stocker les paramètres de catégorisation automatique
CREATE TABLE IF NOT EXISTS public.auto_categorization_rules (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    keyword TEXT NOT NULL,
    category_id BIGINT NOT NULL,
    priority INTEGER DEFAULT 10, -- Plus le nombre est élevé, plus la priorité est haute
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Politiques de sécurité (RLS)
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_categorization_rules ENABLE ROW LEVEL SECURITY;

-- Politique pour les habitudes
CREATE POLICY "Les utilisateurs peuvent accéder à leurs propres habitudes" 
ON public.habits FOR ALL 
USING (auth.uid()::text = user_id);

-- Politique pour les logs d'habitudes (via la relation avec habits)
CREATE POLICY "Les utilisateurs peuvent accéder aux logs de leurs propres habitudes" 
ON public.habit_logs 
FOR ALL USING ((SELECT user_id FROM public.habits WHERE id = habit_logs.habit_id) = auth.uid()::text);

-- Politique pour les règles de catégorisation
CREATE POLICY "Les utilisateurs peuvent gérer leurs propres règles de catégorisation" 
ON public.auto_categorization_rules 
FOR ALL USING (user_id = auth.uid()::text);

-- Politique pour les catégories prédéfinies (lecture seule)
ALTER TABLE public.category_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tout le monde peut lire les catégories prédéfinies" 
ON public.category_presets FOR SELECT USING (true); 