# 🔍 Agent de Recherche Brave Search pour Orra Academy

## Vue d'ensemble

L'agent de recherche Brave Search enrichit automatiquement vos vidéos avec des informations provenant du web en temps réel. Il utilise l'API Brave Search pour collecter des données pertinentes, identifier les tendances et générer des suggestions de contenu.

## 🚀 Fonctionnalités

### 1. Enrichissement automatique de scripts
- **Recherche contextuelle** : Trouve des informations récentes sur le sujet de votre vidéo
- **Points clés** : Extrait les concepts importants à mentionner
- **Sources fiables** : Collecte des références à citer
- **Suggestions de contenu** : Propose des améliorations pour votre script

### 2. Analyse de tendances
- **Tendances actuelles** : Identifie ce qui est populaire dans votre domaine
- **Nouveautés** : Découvre les derniers développements
- **Opportunités** : Suggère de nouveaux sujets de vidéos

### 3. Génération de suggestions
- **Vidéos tendances** : Propose des sujets basés sur l'actualité
- **Scripts optimisés** : Génère du contenu enrichi automatiquement

## 🛠️ Configuration

### 1. Obtenir une clé API Brave Search

1. Visitez [api.search.brave.com](https://api.search.brave.com)
2. Créez un compte et obtenez votre clé API
3. Ajoutez la clé dans votre fichier `.env` :

```bash
BRAVE_API_KEY=votre_cle_api_brave_search
```

### 2. Vérifier l'installation

Lancez le script de test :

```bash
cd backend
python test_brave_search.py
```

## 📋 Utilisation

### Dans l'interface web

#### 1. Génération de script enrichi
1. Ajoutez un prompt à votre vidéo
2. Cliquez sur **"🤖 Générer script enrichi"**
3. L'agent recherche automatiquement des informations pertinentes
4. Le script généré inclut :
   - Points clés trouvés en ligne
   - Suggestions de contenu
   - Tendances actuelles
   - Sources de référence

#### 2. Enrichissement d'une vidéo existante
1. Pour une vidéo avec un script existant
2. Cliquez sur **"🔍 Enrichir recherche"**
3. Le script est enrichi avec de nouvelles informations

#### 3. Suggestions tendances
1. Dans le générateur de vidéos
2. Cliquez sur **"🔥 Tendances"**
3. L'agent génère des suggestions basées sur l'actualité

### Via l'API

#### Recherche pour vidéo
```bash
curl -X POST "http://localhost:8000/api/search/video-research" \
  -H "Content-Type: application/json" \
  -d '{"video_prompt": "Comment créer des automatisations avec N8N"}'
```

#### Recherche de tendances
```bash
curl -X POST "http://localhost:8000/api/search/trends" \
  -H "Content-Type: application/json" \
  -d '{"topic": "Intelligence artificielle"}'
```

## 🔧 API Endpoints

### `POST /api/search/video-research`
Recherche enrichie pour une vidéo

**Body:**
```json
{
  "video_prompt": "Sujet de la vidéo"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "video_prompt": "Sujet de la vidéo",
    "research_summary": {
      "total_sources": 10,
      "key_points": ["point1", "point2"],
      "trending_topics": ["tendance1", "tendance2"],
      "content_suggestions": ["suggestion1", "suggestion2"]
    },
    "sources": [
      {
        "title": "Titre de l'article",
        "url": "https://example.com",
        "description": "Description...",
        "published": "2024-01-01"
      }
    ]
  }
}
```

### `POST /api/search/trends`
Analyse de tendances

**Body:**
```json
{
  "topic": "Intelligence artificielle"
}
```

### `GET /api/search/health`
Vérification de santé du service

## 📊 Exemple de script enrichi

### Avant enrichissement :
```markdown
# Script pour "N8N pour débutants"

## Introduction
Salut tout le monde ! Aujourd'hui, on va parler de N8N.

## Corps principal
- Point 1 : Explication du concept
- Point 2 : Démonstration pratique
```

### Après enrichissement :
```markdown
# Script pour "N8N pour débutants"

## Introduction
Salut tout le monde ! Aujourd'hui, on va parler de N8N.

## Corps principal
- Point 1 : Explication du concept
- Point 2 : Démonstration pratique

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
- N8N 2024: Les nouveautés de la plateforme d'automatisation
- Comment l'automatisation révolutionne le travail en 2024

## Sources de référence :
- [N8N Documentation officielle](https://docs.n8n.io)
- [Tutoriel N8N pour débutants](https://example.com)
- [Guide des meilleures pratiques N8N](https://example.com)
```

## 🎯 Optimisations spécifiques à Orra Academy

L'agent est configuré pour :

- **Rechercher en français** prioritairement
- **Filtrer pour du contenu éducatif** (tutoriels, guides, formations)
- **Identifier les mots-clés techniques** pertinents pour l'IA et l'automatisation
- **Proposer des call-to-action** vers orra-academy.com
- **Générer du contenu adapté** au style de vos vidéos

## 🔍 Paramètres de recherche

- **Pays** : France (FR) par défaut
- **Langue** : Français (fr) par défaut
- **Fraîcheur** : Dernier mois pour du contenu récent
- **Filtrage** : Contenu modéré, pas de contenu adulte
- **Types** : Web et actualités

## 🚨 Limitations

- **Limite API** : Respectez les limites de votre plan Brave Search
- **Qualité variable** : Tous les résultats ne sont pas pertinents
- **Vérification nécessaire** : Vérifiez toujours les informations avant publication
- **Dépendance réseau** : Nécessite une connexion internet

## 🔧 Dépannage

### Erreur "API key manquante"
- Vérifiez que `BRAVE_API_KEY` est dans votre `.env`
- Redémarrez le serveur après ajout de la clé

### Pas de résultats
- Vérifiez votre crédit API Brave Search
- Essayez avec des termes de recherche plus génériques

### Erreur de connexion
- Vérifiez votre connexion internet
- Vérifiez que l'API Brave Search est accessible

## 📈 Monitoring

Consultez les logs pour surveiller l'utilisation :

```bash
# Logs du service
tail -f backend/backend.log | grep "Brave"

# Health check
curl http://localhost:8000/api/search/health
```

## 🎉 Prochaines évolutions

- **Cache intelligent** : Éviter les recherches redondantes
- **Analyse de sentiment** : Filtrer les sources négatives
- **Intégration YouTube** : Analyser les vidéos concurrentes
- **Suggestions personnalisées** : Basées sur votre historique 