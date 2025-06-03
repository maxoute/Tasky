#!/bin/bash

# Couleurs pour le terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration de l'environnement
ENV_FILE="/Users/maxens/Desktop/github-projects/Mentor IA/.env"
BACKEND_DIR="./backend"
FRONTEND_DIR="./frontend"
PID_FILE=".app_pids"
LOGS_DIR="./logs"
MAX_LOG_SIZE=104857600  # 100 Mo en octets
MAX_LOG_FILES=5
BACKUP_DIR="./backups"
HOST="0.0.0.0"  # Écouter sur toutes les interfaces

# Création des dossiers nécessaires
mkdir -p $LOGS_DIR $BACKUP_DIR

# Chargement des variables d'environnement
load_env() {
  if [ -f "$ENV_FILE" ]; then
    log_message "INFO" "Chargement des variables d'environnement..."
    set -a
    source "$ENV_FILE"
    set +a
  else
    log_message "AVERTISSEMENT" "Fichier .env non trouvé, utilisation des valeurs par défaut"
    # Valeurs par défaut pour la production
    export BACKEND_PORT=8000
    export FRONTEND_PORT=3000
    export NODE_ENV=production
    export PYTHON_ENV=production
  fi
}

# Rotation des logs
rotate_logs() {
  local log_file=$1
  if [ -f "$log_file" ]; then
    local size=$(stat -f%z "$log_file" 2>/dev/null || stat -c%s "$log_file")
    if [ "$size" -gt "$MAX_LOG_SIZE" ]; then
      for i in $(seq $MAX_LOG_FILES -1 1); do
        if [ -f "${log_file}.${i}" ]; then
          mv "${log_file}.${i}" "${log_file}.$((i+1))"
        fi
      done
      mv "$log_file" "${log_file}.1"
      touch "$log_file"
    fi
  fi
}

# Backup des données
create_backup() {
  local timestamp=$(date '+%Y%m%d_%H%M%S')
  local backup_file="$BACKUP_DIR/backup_${timestamp}.tar.gz"
  
  log_message "INFO" "Création d'une sauvegarde..."
  
  tar -czf "$backup_file" \
    --exclude="venv" \
    --exclude="node_modules" \
    --exclude=".git" \
    --exclude="logs" \
    --exclude="backups" \
    .
  
  if [ $? -eq 0 ]; then
    log_message "OK" "Sauvegarde créée : $backup_file"
    # Suppression des anciennes sauvegardes (garder les 5 plus récentes)
    ls -t "$BACKUP_DIR"/backup_*.tar.gz | tail -n +6 | xargs -r rm
  else
    log_message "ERREUR" "Échec de la création de la sauvegarde"
  fi
}

# Monitoring des ressources
monitor_resources() {
  local pid=$1
  local service=$2
  
  while kill -0 $pid 2>/dev/null; do
    local cpu_usage=$(ps -p $pid -o %cpu | tail -n 1 | tr -d '[:space:]')
    local mem_usage=$(ps -p $pid -o %mem | tail -n 1 | tr -d '[:space:]')
    
    # Remplacer virgule par point (macOS)
    cpu_usage=${cpu_usage//,/.}
    mem_usage=${mem_usage//,/.}
    
    # Vérifier que c'est bien un nombre
    if [[ $cpu_usage =~ ^[0-9]+([.][0-9]+)?$ ]]; then
      if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        log_message "AVERTISSEMENT" "$service: Utilisation CPU élevée ($cpu_usage%)"
      fi
    fi
    
    if [[ $mem_usage =~ ^[0-9]+([.][0-9]+)?$ ]]; then
      if (( $(echo "$mem_usage > 80" | bc -l) )); then
        log_message "AVERTISSEMENT" "$service: Utilisation mémoire élevée ($mem_usage%)"
      fi
    fi
    
    sleep 60
  done
}

# Nettoyage des anciens fichiers PID
cleanup_old_pids() {
  find . -name ".app_pids*" -type f -delete
}

# Fonction pour logger les messages
log_message() {
  local level=$1
  local message=$2
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo -e "[$timestamp] [$level] $message" >> "$LOGS_DIR/app.log"
  echo -e "${BLUE}[$level]${NC} $message\n"
}

# Fonction pour vérifier les dépendances
check_dependencies() {
  local missing_deps=()
  
  # Vérifier Python
  if ! command -v python3 &> /dev/null; then
    missing_deps+=("Python 3")
  fi
  
  # Vérifier Node.js
  if ! command -v npm &> /dev/null; then
    missing_deps+=("Node.js")
  fi
  
  if [ ${#missing_deps[@]} -ne 0 ]; then
    log_message "ERREUR" "Dépendances manquantes : ${missing_deps[*]}"
    exit 1
  fi
}

# Fonction pour gérer l'environnement virtuel
setup_virtualenv() {
  if [ ! -d "venv" ]; then
    log_message "INFO" "Création de l'environnement virtuel..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
      log_message "ERREUR" "Échec de la création de l'environnement virtuel"
      exit 1
    fi
  fi
  
  source venv/bin/activate
  if [ $? -ne 0 ]; then
    log_message "ERREUR" "Échec de l'activation de l'environnement virtuel"
    exit 1
  fi
  
  # Installation des dépendances Python si nécessaire
  if [ ! -f "venv/.dependencies_installed" ]; then
    log_message "INFO" "Installation des dépendances Python..."
    pip install -r backend/requirements.txt
    touch venv/.dependencies_installed
  fi
}

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
  echo -e "  ${GREEN}backup${NC}     Créer une sauvegarde"
  echo -e "  ${GREEN}help${NC}       Afficher ce message d'aide"
}

# Fonction pour construire l'application React
build_frontend() {
  log_message "INFO" "Construction de l'application React..."
  
  # Vérifier les dépendances
  check_dependencies
  
  # Construire React
  cd $FRONTEND_DIR
  npm run build
  
  if [ $? -eq 0 ]; then
    log_message "OK" "Application React construite avec succès"
  else
    log_message "ERREUR" "Échec de la construction de l'application React"
    exit 1
  fi
  
  cd ..
}

# Fonction pour démarrer le backend
start_backend() {
  log_message "INFO" "Démarrage du backend FastAPI..."
  setup_virtualenv
  rotate_logs "$LOGS_DIR/backend.log"
  cd $BACKEND_DIR
  uvicorn app_fastapi:app --host 0.0.0.0 --port 8000 > ../logs/backend.log 2>&1 &
  BACKEND_PID=$!
  cd ..
  monitor_resources $BACKEND_PID "Backend" &
  MONITOR_PID=$!
  echo "backend:$BACKEND_PID" > $PID_FILE
  echo "backend_monitor:$MONITOR_PID" >> $PID_FILE
  log_message "OK" "Backend démarré avec PID $BACKEND_PID sur http://localhost:8000"
}

# Fonction pour démarrer le frontend
start_frontend() {
  log_message "INFO" "Démarrage du frontend React..."
  check_dependencies
  rotate_logs "$LOGS_DIR/frontend.log"
  cd $FRONTEND_DIR
  NODE_ENV=development npm run dev > ../logs/frontend.log 2>&1 &
  FRONTEND_PID=$!
  cd ..
  monitor_resources $FRONTEND_PID "Frontend" &
  MONITOR_PID=$!
  if [ -f $PID_FILE ]; then
    echo "frontend:$FRONTEND_PID" >> $PID_FILE
    echo "frontend_monitor:$MONITOR_PID" >> $PID_FILE
  else
    echo "frontend:$FRONTEND_PID" > $PID_FILE
    echo "frontend_monitor:$MONITOR_PID" >> $PID_FILE
  fi
  log_message "OK" "Frontend démarré avec PID $FRONTEND_PID sur http://localhost:3000"
}

# Fonction pour arrêter les services
stop_services() {
  log_message "INFO" "Arrêt des services..."
  
  if [ -f $PID_FILE ]; then
    while read line; do
      SERVICE_NAME=$(echo $line | cut -d':' -f1)
      PID=$(echo $line | cut -d':' -f2)
      
      if ps -p $PID > /dev/null; then
        # Arrêt gracieux pour le backend
        if [[ $SERVICE_NAME == "backend" ]]; then
          kill -SIGTERM $PID
          sleep 5
          if ps -p $PID > /dev/null; then
            kill -9 $PID
          fi
        else
          kill $PID
        fi
        
        log_message "OK" "$SERVICE_NAME arrêté (PID: $PID)"
      else
        log_message "AVERTISSEMENT" "$SERVICE_NAME déjà arrêté"
      fi
    done < $PID_FILE
    
    rm $PID_FILE
  else
    log_message "AVERTISSEMENT" "Aucun service en cours d'exécution"
  fi

  # Kill forcé de tous les processus récalcitrants liés à l'app
  pkill -f 'uvicorn'
  pkill -f 'vite'
  pkill -f 'npm run dev'
  pkill -f 'esbuild'
  pkill -f 'node /Users/maxens/Desktop/github-projects/Mentor IA/frontend/node_modules/.bin/vite'

  echo -e "${YELLOW}----------------------${NC}"
  echo ""
  log_message "OK" "Tous les processus liés à l'app (uvicorn, vite, npm, esbuild, node) ont été tués."
  echo ""
  echo -e "${YELLOW}----------------------${NC}"
}

# Fonction pour vérifier le statut des services
check_status() {
  log_message "INFO" "Statut des services:"
  
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
    # Nettoyage préventif avant de démarrer
    pkill -f 'uvicorn'
    pkill -f 'vite'
    pkill -f 'npm run dev'
    pkill -f 'esbuild'
    pkill -f 'node /Users/maxens/Desktop/github-projects/Mentor IA/frontend/node_modules/.bin/vite'
    load_env
    cleanup_old_pids
    check_dependencies
    start_backend
    start_frontend
    log_message "OK" "Application TASKY démarrée avec succès en mode local !"
    echo -e "  Backend: ${BLUE}http://localhost:8000${NC}"
    echo -e "  Frontend: ${BLUE}http://localhost:3000${NC}"
    echo -e "\n--- LOGS BACKEND ---"
    tail -n 20 logs/backend.log
    echo -e "\n--- LOGS FRONTEND ---"
    tail -n 20 logs/frontend.log
    ;;
  stop)
    stop_services
    cleanup_old_pids
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
  backup)
    create_backup
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