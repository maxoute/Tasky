# 🎬 Mentor IA - Gestionnaire de Vidéos avec Agent de Recherche

Application de gestion de vidéos pour **Orra Academy** avec un agent de recherche Brave Search intégré pour enrichir automatiquement vos contenus.

## 🚀 Fonctionnalités

### 📹 Gestion de Vidéos
- **États de production** : À tourner → À monter → À publier → Publié
- **Scripts générés automatiquement** avec prompts personnalisés
- **Réorganisation** des vidéos par glisser-déposer
- **Catégorisation** (Orra Academy, N8N Tutorial, IA Agents, etc.)

### 🔍 Agent de Recherche Brave Search
- **Enrichissement automatique** des scripts avec des informations du web
- **Points clés** extraits des sources récentes
- **Tendances actuelles** dans votre domaine
- **Suggestions de contenu** basées sur l'IA
- **Sources fiables** pour étayer vos vidéos

### ⚡ Workflow Optimisé
1. **Prompt** → Décrivez votre sujet de vidéo
2. **Recherche automatique** → L'agent trouve des informations récentes
3. **Script enrichi** → Génération avec points clés et sources
4. **États de production** → Suivez votre avancement
5. **Publication** → Marquez comme publié

## 🛠️ Installation Rapide

### Méthode 1: Script automatique (recommandé)

```bash
# Cloner le projet
git clone [url-du-repo]
cd Mentor\ IA

# Lancer le script d'installation et de démarrage
./start_app.sh
```

Le script va :
- ✅ Créer l'environnement virtuel Python
- ✅ Installer toutes les dépendances
- ✅ Créer le fichier de configuration
- ✅ Tester l'agent de recherche
- ✅ Démarrer frontend et backend automatiquement

### Méthode 2: Installation manuelle

#### 1. Backend (FastAPI + Python)

```bash
# Créer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate  # ou `venv\Scripts\activate` sur Windows

# Installer les dépendances
cd backend
pip install -r requirements.txt

# Créer le fichier de configuration
cp .env.example .env  # Puis éditer avec vos clés API

# Tester l'installation
python test_brave_search.py

# Lancer le serveur
python app_fastapi.py
```

#### 2. Frontend (React + Vite)

```bash
# Dans un nouveau terminal
cd frontend

# Installer les dépendances Node.js
npm install

# Lancer le serveur de développement
npm run dev
```

## 🔑 Configuration de l'Agent Brave Search

### 1. Obtenir une clé API Brave Search

1. **Visitez** [api.search.brave.com](https://api.search.brave.com)
2. **Créez un compte** (gratuit)
3. **Générez une clé API** dans votre dashboard
4. **Copiez la clé**

### 2. Configurer la clé

Éditez `backend/.env` :

```bash
# API Brave Search pour la recherche de contenu
BRAVE_API_KEY=votre_cle_api_brave_search_ici
```

### 3. Redémarrer le backend

```bash
cd backend
python app_fastapi.py
```

## 📱 Utilisation

### Interface Web

Accédez à **http://localhost:3001**

#### 🎯 Créer une vidéo enrichie

1. **Onglet "Générateur de vidéos IA"**
2. **Saisissez un prompt** : "Comment créer des automatisations avec N8N"
3. **Cliquez "Générer vidéos"** → Script enrichi automatiquement
4. **Ajoutez à votre liste** → Suivez l'état de production

#### 🔄 Enrichir une vidéo existante

1. **Dans la liste des vidéos**
2. **Cliquez "🔍 Enrichir recherche"** → Nouvelles informations ajoutées
3. **Consultez le script** → Points clés et sources intégrés

#### 📈 Découvrir les tendances

1. **Onglet "Générateur"**
2. **Cliquez "🔥 Tendances"** → Suggestions basées sur l'actualité
3. **Sélectionnez vos favoris** → Ajoutez à votre planning

### API (pour développeurs)

#### Recherche pour vidéo
```bash
curl -X POST "http://localhost:8000/api/search/video-research" \
  -H "Content-Type: application/json" \
  -d '{"video_prompt": "Intelligence artificielle en 2024"}'
```

#### Analyse de tendances
```bash
curl -X POST "http://localhost:8000/api/search/trends" \
  -H "Content-Type: application/json" \
  -d '{"topic": "Automatisation"}'
```

## 📊 Exemple de Script Enrichi

### Prompt initial
```
"Créer un tutoriel sur l'automatisation avec N8N"
```

### Script généré avec recherche
```markdown
# Script pour "Créer un tutoriel sur l'automatisation avec N8N"

## Introduction (0-30s)
Salut tout le monde ! Bienvenue sur Orra Academy. 
Aujourd'hui, on va découvrir l'automatisation avec N8N.

## Corps principal (30s-3min)

### Points clés à aborder (recherche en ligne) :
- automatisation
- workflow
- n8n
- api
- productivité

## Suggestions de contenu (IA) :
- Démonstration en direct avec N8N
- Inclure des exemples concrets et pratiques
- Prévoir un call-to-action vers orra-academy.com

## Tendances actuelles :
- N8N 2024: Les nouveautés de la plateforme
- Comment l'automatisation révolutionne le travail

## Sources de référence :
- [Documentation N8N officielle](https://docs.n8n.io)
- [Guide des meilleures pratiques N8N](https://example.com)
```

## 🔧 Architecture Technique

### Backend (FastAPI)
- **Services** : Brave Search, gestion des vidéos, enrichissement IA
- **Routes** : CRUD vidéos, recherche, tendances, health checks
- **Base de données** : JSON local (extensible vers Supabase)

### Frontend (React + Vite)
- **Pages** : Dashboard, gestion vidéos, générateur IA
- **Services** : API calls, gestion des états, enrichissement
- **UI** : Tailwind CSS, Framer Motion, design responsive

### Agent de Recherche
- **API Brave Search** : Recherche web temps réel
- **Enrichissement intelligent** : Extraction de points clés
- **Analyse de tendances** : Identification d'opportunités
- **Cache et optimisation** : Évite les requêtes redondantes

## 🚨 Dépannage

### Agent de recherche indisponible
- ✅ Vérifiez votre `BRAVE_API_KEY` dans `backend/.env`
- ✅ Redémarrez le backend après ajout de la clé
- ✅ Vérifiez votre connexion internet
- ✅ Consultez les logs : `tail -f backend/backend.log`

### Erreurs de connexion
- ✅ Backend sur **http://localhost:8000**
- ✅ Frontend sur **http://localhost:3001**
- ✅ Vérifiez que les deux serveurs sont lancés

### Performance lente
- ✅ L'enrichissement peut prendre 3-5 secondes (recherche web)
- ✅ Les résultats sont mis en cache pour éviter les re-requêtes
- ✅ Utilisez des prompts spécifiques pour de meilleurs résultats

## 📈 Évolutions Prévues

- 🔄 **Cache intelligent** : Éviter les recherches redondantes
- 📊 **Analytics avancées** : Statistiques de performance des vidéos
- 🔗 **Intégration YouTube** : Analyse de la concurrence
- 🤖 **IA personnalisée** : Suggestions basées sur votre historique
- 🌐 **Multi-langues** : Support anglais et autres langues

## 🤝 Contribution

1. **Fork** le projet
2. **Créez une branche** pour votre fonctionnalité
3. **Committez** vos changements
4. **Créez une Pull Request**

## 📄 License

MIT License - Voir le fichier `LICENSE` pour plus de détails.

## 🎯 Contact

**Orra Academy** - [orra-academy.com](https://orra-academy.com)

---

*Transformez votre processus de création vidéo avec l'intelligence artificielle !* 🚀


