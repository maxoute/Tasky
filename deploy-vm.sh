#!/bin/bash

# Arrêt des conteneurs existants
docker-compose down

# Récupération des dernières modifications
git pull origin main

# Construction et démarrage des conteneurs
docker-compose up --build -d

# Nettoyage des images non utilisées
docker image prune -f 