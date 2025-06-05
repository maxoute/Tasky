# Configuration Webhook N8N pour Brave Search Service

## 🎯 Objectif

Automatiser l'envoi des données de recherche et scripts vidéo générés vers N8N pour traitement automatique dans tes workflows d'Orra Academy.

**URL Webhook configurée :** `https://n8n.orra-academy.com/webhook-test/a91757b0-e982-4343-bcfd-87b807eb34d7`

## 📋 Prérequis

1. Instance N8N fonctionnelle (✅ orra-academy.com)
2. API key Brave Search configurée
3. Backend FastAPI en cours d'exécution

## 🔧 Configuration N8N

### Étape 1 : Créer un Webhook Node

1. **Ouvre N8N** et crée un nouveau workflow
2. **Ajoute un node "Webhook"**
3. **Configure le webhook :**
   - Method: `POST`
   - Path: `/webhook/brave-search`
   - Authentication: None (ou Basic si souhaité)
   - Response Mode: `Return After Last Node`

4. **Note l'URL générée** (ex: `https://your-n8n.app/webhook/brave-search`)

### Étape 2 : Workflow de traitement

Exemple de workflow N8N pour traiter les données :

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Webhook   │ -> │   Switch    │ -> │  Function   │ -> │   Action    │
│             │    │ (event_type)│    │ (process)   │    │ (save/send) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

#### Node Switch - Branches par type d'événement

```javascript
// Configuration Switch Node
switch ($node["Webhook"].json["event_type"]) {
  case "video_script_generated":
    return 0; // Branch script vidéo
  case "video_content_research":
    return 1; // Branch recherche contenu
  case "webhook_test":
    return 2; // Branch test
  default:
    return 3; // Branch default
}
```

#### Node Function - Traitement des scripts vidéo

```javascript
// Pour les scripts vidéo générés
const data = $node["Webhook"].json;

return {
  script_title: data.data.research_data.key_points[0] || "Script généré",
  script_content: data.data.script,
  topic: data.data.research_data.key_points.join(", "),
  sources_count: data.data.research_data.sources_count,
  generated_at: data.data.generated_at,
  author: "Maxens - Orra Academy",
  webhook_source: data.source
};
```

### Étape 3 : Actions possibles

**Pour les scripts vidéo :**
- 📄 Sauvegarder dans Google Drive
- ✉️ Envoyer par email via Mailgun
- 📝 Créer une page Notion
- 📊 Ajouter dans une base Supabase

**Pour les recherches :**
- 🔍 Analyser les tendances avec ChatGPT
- 📈 Créer des rapports automatiques
- 🎥 Planifier des vidéos futures

## 🔧 Configuration Variables d'Environnement

### Fichier `.env`

```bash
# Configuration Brave Search
BRAVE_API_KEY=your_brave_api_key_here

# Configuration Webhook N8N - URL Orra Academy
N8N_WEBHOOK_ENABLED=true
N8N_WEBHOOK_URL=https://n8n.orra-academy.com/webhook-test/a91757b0-e982-4343-bcfd-87b807eb34d7

# Autres
ENVIRONMENT=production
SENTRY_DSN=your_sentry_dsn
```

### Variables d'environnement Docker

```yaml
# docker-compose.yml ou variables K8s
environment:
  - BRAVE_API_KEY=${BRAVE_API_KEY}
  - N8N_WEBHOOK_ENABLED=true
  - N8N_WEBHOOK_URL=${N8N_WEBHOOK_URL}
```

## 📊 Nouveaux Types d'Événements

### `video_prompt_received` (NOUVEAU)
Ce payload est envoyé **dès qu'un prompt vidéo est reçu**, avant même de commencer la génération :

```json
{
  "event_type": "video_prompt_received",
  "timestamp": "2024-01-15T10:30:00",
  "source": "brave_search_service",
  "data": {
    "topic": "N8N pour les débutants",
    "target_audience": "débutants",
    "request_id": "video_20240115_103000",
    "status": "prompt_received",
    "next_action": "generate_script"
  },
  "metadata": {
    "generated_by": "Orra Academy - Video Script Generator",
    "version": "1.0",
    "user": "Maxens - CTO Orra Academy"
  }
}
```

### `video_script_generated` (MODIFIÉ)
Maintenant inclut les informations du prompt initial :

```json
{
  "event_type": "video_script_generated",
  "data": {
    "script": "# Script pour \"N8N pour débutants\"...",
    "research_data": {...},
    "generated_at": "2024-01-15T10:35:00",
    "request_id": "video_20240115_103000",
    "prompt_webhook_status": {
      "status": "success",
      "message": "Prompt envoyé avec succès"
    }
  }
}
```

## 🔄 Flux de Traitement Complet

Voici le nouveau flux quand tu génères un script vidéo :

```
1. 📝 Prompt reçu → Webhook N8N ("video_prompt_received")
2. 🔍 Recherche Brave → Analyse des données
3. 🎬 Génération script → Webhook N8N ("video_script_generated")  
4. ✅ Résultat final → Retour API
```

## 🧪 Tests avec ton Webhook

### 1. Test direct du prompt

```bash
curl -X POST "http://localhost:8000/api/search/video/script-with-webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Automatisation N8N pour Orra Academy",
    "target_audience": "entrepreneurs"
  }'
```

### 2. Test de connectivité

```bash
curl -X POST "http://localhost:8000/api/search/test-webhook" \
  -H "Content-Type: application/json"
```

### 3. Vérification de la configuration

```bash
curl -X GET "http://localhost:8000/api/search/webhook/status"
```

Réponse attendue :
```json
{
  "webhook_enabled": true,
  "webhook_configured": true,
  "webhook_url": "https://n8n.orra-academy.com/webhook-test/a91757b0-e982-4343-bcfd-87b807eb34d7"
}
```

## 🎯 Cas d'Usage pour tes Workflows N8N

### Workflow 1 : Notification Immédiate
```
Webhook (prompt_received) → Slack/Discord → "Maxens génère une vidéo sur {topic}"
```

### Workflow 2 : Préparation Contenu
```
Webhook (prompt_received) → Function (extract topic) → Google Calendar (créer événement) → Notion (préparer page)
```

### Workflow 3 : Pipeline Complet Newsletter
```
Webhook (script_generated) → Function (format) → Mailgun (brouillon) → Notion (archive) → Analytics
```

### Workflow 4 : Suivi Performance
```
Webhook (script_generated) → Supabase (save) → Google Sheets (analytics) → Dashboard
```

## 📊 Variables d'Environnement Docker

```yaml
# docker-compose.yml
environment:
  - BRAVE_API_KEY=${BRAVE_API_KEY}
  - N8N_WEBHOOK_ENABLED=true
  - N8N_WEBHOOK_URL=https://n8n.orra-academy.com/webhook-test/a91757b0-e982-4343-bcfd-87b807eb34d7
```

## 🔐 Sécurité & Production

1. **L'URL webhook est unique** : `a91757b0-e982-4343-bcfd-87b807eb34d7`
2. **HTTPS obligatoire** : orra-academy.com utilise SSL
3. **Logs détaillés** : Toutes les requêtes sont loggées
4. **Timeout 30s** : Protection contre les workflows lents

## 🚀 Déploiement Recommandé

```bash
# 1. Configurer les variables
export N8N_WEBHOOK_ENABLED=true
export N8N_WEBHOOK_URL="https://n8n.orra-academy.com/webhook-test/a91757b0-e982-4343-bcfd-87b807eb34d7"

# 2. Redémarrer le service
docker-compose restart backend

# 3. Tester la connexion
curl -X GET "http://localhost:8000/api/search/webhook/status"
```

## 🐛 Troubleshooting

### Problèmes courants

1. **Webhook non reçu :**
   - Vérifier l'URL N8N (doit être accessible depuis le backend)
   - Vérifier les variables d'environnement
   - Consulter les logs backend

2. **Erreur 500 :**
   - Vérifier la configuration N8N
   - Valider le format JSON
   - Consulter les logs N8N

3. **Timeout :**
   - N8N trop lent (>30s)
   - Simplifier le workflow N8N
   - Ajouter des nodes "NoOp" pour optimiser

### Logs utiles

```bash
# Backend logs
tail -f backend/backend.log | grep "webhook\|n8n"

# Docker logs
docker logs -f container_name | grep webhook
```

## 🚀 Mise en Production

1. **Variables d'environnement :**
   - Utiliser des secrets managers (K8s secrets, AWS SSM, etc.)
   - Ne jamais commiter les vraies URLs

2. **Sécurité :**
   - Ajouter une authentification webhook si nécessaire
   - Utiliser HTTPS uniquement
   - Valider les données avant envoi

3. **Monitoring :**
   - Sentry pour les erreurs
   - Métriques Prometheus pour le monitoring
   - Alertes sur les échecs webhook

4. **Backup :**
   - Sauvegarder les workflows N8N
   - Versioning des configurations

## 📚 Ressources

- [Documentation N8N Webhooks](https://docs.n8n.io/nodes/n8n-nodes-base.webhook/)
- [FastAPI Background Tasks](https://fastapi.tiangolo.com/tutorial/background-tasks/)
- [Requests Documentation](https://requests.readthedocs.io/) 