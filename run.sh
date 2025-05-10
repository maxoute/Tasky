#!/bin/bash

# Couleurs pour le terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Chemins des applications
BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend"
PID_FILE=".app_pids"

# Fonction pour afficher le message d'aide
show_help() {
  echo -e "${BLUE}Usage:${NC}"
  echo -e "  $0 [option]"
  echo ""
  echo -e "${BLUE}Options:${NC}"
  echo -e "  ${GREEN}start${NC}      Démarrer le backend et le frontend"
  echo -e "  ${GREEN}stop${NC}       Arrêter le backend et le frontend"
  echo -e "  ${GREEN}backend${NC}    Démarrer uniquement le backend"
  echo -e "  ${GREEN}frontend${NC}   Démarrer uniquement le frontend"
  echo -e "  ${GREEN}build${NC}      Construire l'application React"
  echo -e "  ${GREEN}status${NC}     Afficher le statut des services"
  echo -e "  ${GREEN}help${NC}       Afficher ce message d'aide"
}

# Fonction pour construire l'application React
build_frontend() {
  echo -e "${BLUE}[INFO]${NC} Construction de l'application React..."
  
  # Vérifier si Node.js est installé
  if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERREUR]${NC} Node.js n'est pas installé"
    exit 1
  fi
  
  # Construire React
  cd $FRONTEND_DIR
  npm run build
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}[OK]${NC} Application React construite avec succès"
  else
    echo -e "${RED}[ERREUR]${NC} Échec de la construction de l'application React"
    exit 1
  fi
  
  cd ..
}

# Fonction pour démarrer le backend
start_backend() {
  echo -e "${BLUE}[INFO]${NC} Démarrage du backend FastAPI..."
  
  # Vérifier si l'environnement virtuel existe
  if [ -d "venv" ]; then
    source venv/bin/activate
  else
    echo -e "${YELLOW}[AVERTISSEMENT]${NC} Environnement virtuel non trouvé, utilisation de Python système"
  fi
  
  # Aller dans le répertoire backend et démarrer FastAPI en arrière-plan
  cd $BACKEND_DIR
  python app_fastapi.py > ../backend.log 2>&1 &
  BACKEND_PID=$!
  cd ..
  
  # Enregistrer le PID pour pouvoir l'arrêter plus tard
  echo "backend:$BACKEND_PID" > $PID_FILE
  
  echo -e "${GREEN}[OK]${NC} Backend démarré avec PID $BACKEND_PID sur http://localhost:8000"
}

# Fonction pour démarrer le frontend
start_frontend() {
  echo -e "${BLUE}[INFO]${NC} Démarrage du frontend React..."
  
  # Vérifier si Node.js est installé
  if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERREUR]${NC} Node.js n'est pas installé"
    exit 1
  fi
  
  # Démarrer React en arrière-plan
  cd $FRONTEND_DIR
  npm start > ../frontend.log 2>&1 &
  FRONTEND_PID=$!
  cd ..
  
  # Ajouter le PID au fichier
  if [ -f $PID_FILE ]; then
    echo "frontend:$FRONTEND_PID" >> $PID_FILE
  else
    echo "frontend:$FRONTEND_PID" > $PID_FILE
  fi
  
  echo -e "${GREEN}[OK]${NC} Frontend démarré avec PID $FRONTEND_PID sur http://localhost:3000"
}

# Fonction pour arrêter les services
stop_services() {
  echo -e "${BLUE}[INFO]${NC} Arrêt des services..."
  
  if [ -f $PID_FILE ]; then
    while read line; do
      SERVICE_NAME=$(echo $line | cut -d':' -f1)
      PID=$(echo $line | cut -d':' -f2)
      
      if ps -p $PID > /dev/null; then
        kill $PID
        echo -e "${GREEN}[OK]${NC} $SERVICE_NAME arrêté (PID: $PID)"
      else
        echo -e "${YELLOW}[AVERTISSEMENT]${NC} $SERVICE_NAME déjà arrêté"
      fi
    done < $PID_FILE
    
    rm $PID_FILE
  else
    echo -e "${YELLOW}[AVERTISSEMENT]${NC} Aucun service en cours d'exécution"
  fi
}

# Fonction pour vérifier le statut des services
check_status() {
  echo -e "${BLUE}[INFO]${NC} Statut des services:"
  
  if [ -f $PID_FILE ]; then
    while read line; do
      SERVICE_NAME=$(echo $line | cut -d':' -f1)
      PID=$(echo $line | cut -d':' -f2)
      
      if ps -p $PID > /dev/null; then
        echo -e "  ${GREEN}●${NC} $SERVICE_NAME est en cours d'exécution (PID: $PID)"
      else
        echo -e "  ${RED}●${NC} $SERVICE_NAME est arrêté"
      fi
    done < $PID_FILE
  else
    echo -e "  ${RED}●${NC} Aucun service n'est en cours d'exécution"
  fi
}

# Traiter les arguments
case "$1" in
  start)
    start_backend
    start_frontend
    echo -e "${GREEN}[OK]${NC} Application TASK. démarrée avec succès!"
    echo -e "  Backend: ${BLUE}http://localhost:8000${NC}"
    echo -e "  Frontend: ${BLUE}http://localhost:3000${NC}"
    ;;
  stop)
    stop_services
    ;;
  backend)
    start_backend
    ;;
  frontend)
    start_frontend
    ;;
  build)
    build_frontend
    ;;
  status)
    check_status
    ;;
  help|--help|-h)
    show_help
    ;;
  *)
    # Si aucun argument n'est fourni, afficher l'aide
    show_help
    ;;
esac

exit 0 