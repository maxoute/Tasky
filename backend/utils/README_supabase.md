# Utilitaire de Test Supabase

Ce dossier contient des utilitaires pour tester et interagir avec Supabase.

## Organisation des fichiers

- `supabase_test.py` : Outil de diagnostic pour tester la connexion et les fonctionnalités Supabase

## Architecture Supabase dans le projet

Le projet utilise Supabase de deux manières :

1. **Version simple (backend/supabase_service.py)** : Implémentation fonctionnelle avec des fonctions pour les opérations CRUD basiques
2. **Version avancée (backend/services/supabase_service.py)** : Implémentation avec pattern Singleton et fonctionnalités étendues

## Utilisation de l'utilitaire de test

Pour tester la connexion à Supabase et ses fonctionnalités, utilisez l'utilitaire `supabase_test.py` :

```bash
# Test basique avec la clé anonyme
python utils/supabase_test.py

# Test avec la clé de service (admin)
python utils/supabase_test.py --admin

# Créer des données de test (avec la clé admin)
python utils/supabase_test.py --admin --create-data

# Vérifier les politiques RLS
python utils/supabase_test.py --check-rls

# Afficher toutes les options
python utils/supabase_test.py --help
```

## Configuration des Tables Supabase

Les tables principales utilisées par l'application sont :

### Table `tasks`

```sql
CREATE TABLE IF NOT EXISTS public.tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT,
    theme TEXT NOT NULL,
    text TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT false,
    hashtags TEXT[] DEFAULT '{}',
    eisenhower TEXT,
    estimated_time TEXT,
    deadline DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### Table `categories`

```sql
CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

## Politiques RLS (Row Level Security)

Pour que l'application fonctionne correctement en production, il est recommandé d'activer RLS et de configurer des politiques de sécurité. Exemples :

```sql
-- Activer RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Créer des politiques
CREATE POLICY "Les utilisateurs peuvent lire leurs propres tâches" 
ON public.tasks FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres tâches" 
ON public.tasks FOR ALL 
USING (auth.uid()::text = user_id);

CREATE POLICY "Les utilisateurs peuvent lire leurs propres catégories" 
ON public.categories FOR SELECT 
USING (auth.uid()::text = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres catégories" 
ON public.categories FOR ALL 
USING (auth.uid()::text = user_id);
```

Pour le développement, vous pouvez temporairement désactiver RLS ou créer des politiques plus permissives :

```sql
-- Politique d'accès public (DÉVELOPPEMENT UNIQUEMENT)
CREATE POLICY "Accès public pour test" 
ON public.tasks FOR ALL 
USING (true);

CREATE POLICY "Accès public pour test" 
ON public.categories FOR ALL 
USING (true);
``` 