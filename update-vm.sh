#!/bin/bash

# Script de mise à jour automatique sur VM
# Usage: ./update-vm.sh

VM_IP="104.197.93.255"
VM_USER="maxens"
PROJECT_DIR="~/Tasky"

echo "🚀 Mise à jour Tasky/Mentor IA sur VM"
echo "======================================="

# Se connecter à la VM et exécuter les commandes de mise à jour
ssh -o StrictHostKeyChecking=no $VM_USER@$VM_IP << 'EOF'
    echo "📍 Naviguer vers le projet..."
    cd ~/Tasky || { echo "❌ Erreur: Dossier Tasky non trouvé"; exit 1; }
    
    echo "📥 Récupération des dernières modifications..."
    git pull origin main
    
    echo "🔄 Redémarrage des services Docker..."
    docker-compose down
    docker-compose up -d --build
    
    echo "⏱️  Attente du démarrage des services..."
    sleep 15
    
    echo "🔍 Vérification du statut des conteneurs..."
    docker-compose ps
    
    echo "📊 Logs backend (dernières 10 lignes)..."
    docker-compose logs backend | tail -10
    
    echo "✅ Mise à jour terminée!"
    echo ""
    echo "🌐 Application accessible sur:"
    echo "   Frontend: http://104.197.93.255:3001"
    echo "   Backend API: http://104.197.93.255:8001/docs"
    echo ""
EOF

echo "🎉 Déploiement terminé!" 