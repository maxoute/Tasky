# Stage 1: Build Frontend
FROM node:18-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python Backend
FROM python:3.9-slim
WORKDIR /app

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copie des fichiers backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie du backend
COPY backend/ ./backend/

# Copie du frontend buildé
COPY --from=frontend-builder /app/frontend/build ./backend/static

# Configuration des variables d'environnement
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Exposition du port
EXPOSE 8000

# Commande de démarrage
CMD ["python", "backend/app.py"] 