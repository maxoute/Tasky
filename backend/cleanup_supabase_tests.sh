#!/bin/bash
# Script pour nettoyer les fichiers de test Supabase redondants

# Créer un répertoire d'archives s'il n'existe pas
mkdir -p archives/supabase_tests

# Liste des fichiers à archiver
FILES_TO_ARCHIVE=(
  "test_admin.py"
  "test_categories.py"
  "test_supabase.py"
  "test_supabase_debug.py"
  "test_supabase_fixed.py"
  "test_supabase_service.py"
  "test_supabase_simple.py"
  "test_supabase_tables.py"
  "corrige_service_supabase.py"
  "sql_disable_rls.py"
)

echo "Archivage des fichiers de test Supabase..."

# Déplacer chaque fichier vers le répertoire d'archives
for file in "${FILES_TO_ARCHIVE[@]}"; do
  if [ -f "$file" ]; then
    echo "- Archivage de $file"
    mv "$file" archives/supabase_tests/
  else
    echo "- $file non trouvé, ignoré"
  fi
done

echo "Archivage terminé. Les fichiers ont été déplacés dans archives/supabase_tests/"
echo "Utilisez désormais utils/supabase_test.py pour les tests Supabase." 