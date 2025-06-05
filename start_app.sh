#!/bin/bash

echo "🚀 Démarrage de l'application Mentor IA avec agent Brave Search..."

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher des messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCÈS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERREUR]${NC} $1"
}

# Vérifier si nous sommes dans le bon répertoire
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Veuillez exécuter ce script depuis la racine du projet (dossier contenant backend/ et frontend/)"
    exit 1
fi

# Vérifier la configuration backend
print_status "Vérification de la configuration backend..."

if [ ! -f "backend/.env" ]; then
    print_warning "Fichier backend/.env manquant"
    print_status "Création du fichier .env avec des valeurs par défaut..."
    
    cat > backend/.env << EOL
# Variables d'environnement pour l'application Tasky

# API Brave Search pour la recherche de contenu
# Obtenez votre clé sur: https://api.search.brave.com
BRAVE_API_KEY=

# Sécurité
SECRET_KEY=dev_secret_key_change_in_production
ENVIRONMENT=development

# CORS - Autorisations d'origine pour le frontend
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001

# Monitoring (optionnel)
SENTRY_DSN=

# Base de données Supabase (optionnel)
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# LLM Service (optionnel)
OPENAI_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434

# Google Calendar (optionnel)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EOL
    
    print_success "Fichier .env créé dans backend/"
    print_warning "N'oubliez pas d'ajouter votre BRAVE_API_KEY pour activer l'agent de recherche !"
fi

# Vérifier les dépendances Python
print_status "Vérification des dépendances Python..."
if [ ! -f "backend/requirements.txt" ]; then
    print_error "Fichier requirements.txt manquant dans backend/"
    exit 1
fi

# Installer les dépendances Python si nécessaire
if [ ! -d "venv" ]; then
    print_status "Création de l'environnement virtuel Python..."
    python3 -m venv venv
    print_success "Environnement virtuel créé"
fi

# Activer l'environnement virtuel et installer les dépendances
print_status "Installation des dépendances Python..."
source venv/bin/activate
pip install -r backend/requirements.txt

# Vérifier les dépendances Node.js
print_status "Vérification des dépendances Node.js..."
if [ ! -d "frontend/node_modules" ]; then
    print_status "Installation des dépendances Node.js..."
    cd frontend
    npm install
    cd ..
    print_success "Dépendances Node.js installées"
fi

# Tester l'agent Brave Search
print_status "Test de l'agent Brave Search..."
cd backend
python test_brave_search.py
cd ..

print_success "Configuration terminée !"
print_status "Démarrage des serveurs..."

# Fonction pour nettoyer les processus en arrière-plan
cleanup() {
    print_status "Arrêt des serveurs..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturer Ctrl+C pour nettoyer
trap cleanup INT

# Démarrer le backend
print_status "Démarrage du backend FastAPI sur http://localhost:8000..."
cd backend
source ../venv/bin/activate
python app_fastapi.py &
BACKEND_PID=$!
cd ..

# Attendre que le backend démarre
sleep 3

# Démarrer le frontend
print_status "Démarrage du frontend React sur http://localhost:3001..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

print_success "Application démarrée !"
echo ""
echo "📱 Frontend: http://localhost:3001"
echo "🔧 API Backend: http://localhost:8000"
echo "📚 Documentation API: http://localhost:8000/api/docs"
echo ""
print_status "Appuyez sur Ctrl+C pour arrêter les serveurs"

# Attendre indéfiniment
wait 