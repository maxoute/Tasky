-- Script pour ajouter la colonne 'title' à la table 'tasks' dans Supabase
-- Exécuter ce script dans l'interface SQL de Supabase ou via le client

-- Ajouter la colonne title (optionnelle d'abord)
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS title TEXT;

-- Remplir les titles existants avec le début du text (pour les tâches existantes)
UPDATE public.tasks 
SET title = CASE 
    WHEN LENGTH(text) > 50 THEN LEFT(text, 50) || '...'
    ELSE text
END
WHERE title IS NULL OR title = '';

-- Optionnel: Rendre la colonne obligatoire après avoir rempli les valeurs
-- ALTER TABLE public.tasks 
-- ALTER COLUMN title SET NOT NULL;

-- Vérifier que tout s'est bien passé
SELECT id, title, text, theme, user_id, created_at 
FROM public.tasks 
ORDER BY created_at DESC 
LIMIT 5; 