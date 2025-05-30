#!/bin/bash

# Script de déploiement amélioré pour l'application To-Do

set -e  # Arrête le script en cas d'erreur

echo "==== Démarrage du déploiement ===="

# Vérification des prérequis
command -v python3 >/dev/null 2>&1 || { echo "Python 3 est requis mais n'est pas installé. Abandon."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm est requis mais n'est pas installé. Abandon."; exit 1; }

# Vérification des variables d'environnement
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "Erreur: Les variables d'environnement SUPABASE_URL et SUPABASE_KEY sont requises."
  exit 1
fi


# Installation des dépendances backend
echo "Installation des dépendances backend..."
cd backend
python3 -m pip install --upgrade pip
pip install -r requirements.txt

# Configuration de l'environnement backend
if [ ! -f .env ]; then
    echo "Création du fichier .env..."
    cat > .env << EOF
SUPABASE_URL=${SUPABASE_URL}
SUPABASE_KEY=${SUPABASE_KEY}
OPENAI_API_KEY=${OPENAI_API_KEY:-votre-clé-api}
OLLAMA_MODEL=${OLLAMA_MODEL:-llama3}
EOF
fi

# Installation et build du frontend
echo "Installation des dépendances frontend..."
cd ../frontend
npm ci  # Installation propre des dépendances
npm run build

# Copie des fichiers statiques
echo "Copie des fichiers statiques..."
mkdir -p ../backend/static
cp -r build/* ../backend/static/

# Retour au dossier principal
cd ..

echo "==== Déploiement terminé avec succès ===="
echo "L'application est prête à être démarrée."
echo "Pour démarrer :"
echo "1. cd backend"
echo "2. python app.py"


