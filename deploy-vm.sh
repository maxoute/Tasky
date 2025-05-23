#!/bin/bash

# Script de déploiement pour VM
# Usage: ./deploy-vm.sh [repo_url]

set -e

echo "🚀 Déploiement Tasky/Mentor IA sur VM"
echo "======================================"

# Configuration
REPO_URL=${1:-"https://github.com/maxoute/Tasky.git"}
APP_DIR="/opt/tasky"
COMPOSE_FILE="docker-compose.yml"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Créer le répertoire d'application
log_info "Création/vérification du répertoire d'application..."
sudo mkdir -p $APP_DIR
cd $APP_DIR

# Cloner ou mettre à jour le repository
if [ -d ".git" ]; then
    log_info "Mise à jour du repository existant..."
    sudo git fetch origin
    sudo git reset --hard origin/main
    sudo git pull origin main
else
    log_info "Clonage du repository..."
    sudo git clone $REPO_URL .
fi

# Créer le fichier .env backend si inexistant
if [ ! -f "backend/.env" ]; then
    log_warn "Fichier backend/.env manquant. Création avec des valeurs par défaut..."
    sudo tee backend/.env > /dev/null <<EOF
# Configuration FastAPI
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=your-super-secret-key-change-in-production
API_VERSION=v1

# Base de données Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:80","http://your-domain.com"]
EOF
    log_warn "⚠️  IMPORTANT: Éditez backend/.env avec vos vraies clés API !"
fi

# Arrêter les conteneurs existants
log_info "Arrêt des conteneurs existants..."
sudo docker-compose down --remove-orphans

# Supprimer les images anciennes (optionnel)
log_info "Nettoyage des images Docker..."
sudo docker system prune -f

# Construire et démarrer les services
log_info "Construction et démarrage des services..."
sudo docker-compose up --build -d

# Vérifier le statut des services
log_info "Vérification du statut des services..."
sleep 10
sudo docker-compose ps

# Vérifier les logs en cas d'erreur
if [ $? -ne 0 ]; then
    log_error "Erreur lors du démarrage. Affichage des logs:"
    sudo docker-compose logs
    exit 1
fi

# Afficher les ports
log_info "Services déployés avec succès !"
echo
echo "📱 Frontend: http://$(hostname -I | awk '{print $1}'):3000"
echo "🔧 Backend:  http://$(hostname -I | awk '{print $1}'):8000"
echo "📊 API Docs: http://$(hostname -I | awk '{print $1}'):8000/docs"
echo
echo "📋 Commandes utiles:"
echo "  - Voir les logs:        sudo docker-compose logs -f"
echo "  - Redémarrer:          sudo docker-compose restart"
echo "  - Arrêter:             sudo docker-compose down"
echo "  - Mettre à jour:       ./deploy-vm.sh"
echo
log_warn "N'oubliez pas de configurer votre firewall pour les ports 3000 et 8000 !" 