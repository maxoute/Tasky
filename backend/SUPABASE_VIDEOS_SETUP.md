# 🎬 Configuration Table Vidéos - Supabase

Guide complet pour créer et configurer la table `videos` dans Supabase pour l'application **Mentor IA**.

## 📋 Prérequis

- Compte Supabase actif : [supabase.com](https://supabase.com)
- Projet Supabase créé
- Accès à l'éditeur SQL de Supabase

## 🚀 Installation

### 1. Accéder à l'éditeur SQL

1. **Connectez-vous** à votre dashboard Supabase
2. **Sélectionnez** votre projet
3. **Cliquez** sur "SQL Editor" dans le menu latéral
4. **Créez** un nouveau script SQL

### 2. Exécuter le script de création

**Copiez et collez** le contenu du fichier `create_videos_table.sql` dans l'éditeur SQL puis **exécutez-le**.

Le script va créer :
- ✅ Types ENUM pour les statuts et priorités
- ✅ Table `videos` avec tous les champs nécessaires
- ✅ Index pour les performances
- ✅ Triggers pour `updated_at`
- ✅ Fonction pour les statistiques
- ✅ Politiques de sécurité RLS
- ✅ Données d'exemple

### 3. Vérifier la création

Après exécution, vous devriez voir :
```sql
-- Résultat attendu
total_videos | videos_a_tourner | videos_a_monter | videos_a_publier | videos_publiees | videos_enriched
-------------|------------------|-----------------|------------------|-----------------|----------------
3            | 1                | 1               | 1                | 0               | 0
```

## 🗂️ Structure de la table

### Champs principaux

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique (auto-généré) |
| `title` | VARCHAR(255) | Titre de la vidéo |
| `prompt` | TEXT | Prompt initial pour la génération |
| `script` | TEXT | Script de la vidéo |
| `status` | ENUM | État : `a_tourner`, `a_monter`, `a_publier`, `publie` |
| `priority` | ENUM | Priorité : `low`, `medium`, `high` |
| `category` | VARCHAR(100) | Catégorie (ex: "Orra Academy", "N8N Tutorial") |
| `deadline` | DATE | Date limite |

### Champs pour l'agent de recherche

| Champ | Type | Description |
|-------|------|-------------|
| `enriched_with_search` | BOOLEAN | Vidéo enrichie avec Brave Search |
| `research_data` | JSONB | Données de recherche (sources, points clés) |
| `search_keywords` | TEXT[] | Mots-clés de recherche |
| `last_search_update` | TIMESTAMP | Dernière mise à jour recherche |

### Métadonnées de production

| Champ | Type | Description |
|-------|------|-------------|
| `filming_date` | DATE | Date de tournage |
| `editing_date` | DATE | Date de montage |
| `publish_date` | DATE | Date de publication |
| `youtube_url` | VARCHAR(500) | URL YouTube |
| `thumbnail_url` | VARCHAR(500) | URL de la miniature |

### Statistiques

| Champ | Type | Description |
|-------|------|-------------|
| `estimated_duration` | INTEGER | Durée estimée (minutes) |
| `actual_duration` | INTEGER | Durée réelle (minutes) |
| `views_count` | INTEGER | Nombre de vues |
| `likes_count` | INTEGER | Nombre de likes |

## 🔐 Configuration des variables d'environnement

Ajoutez dans votre fichier `backend/.env` :

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Où trouver ces informations ?

1. **SUPABASE_URL** : Dashboard → Settings → API → Project URL
2. **SUPABASE_SERVICE_ROLE_KEY** : Dashboard → Settings → API → service_role key

⚠️ **Attention** : Utilisez la `service_role` key (pas la `anon` key) pour les opérations backend.

## 🧪 Test de la configuration

1. **Démarrez le backend** :
```bash
cd backend
python test_search_server.py
```

2. **Testez l'API vidéos** :
```bash
python test_videos_api.py
```

3. **Vérifiez les endpoints** :
- GET `/api/videos/health` - Santé du service
- GET `/api/videos/stats` - Statistiques
- GET `/api/videos/` - Liste des vidéos

## 📊 Fonctions utiles

### Obtenir les statistiques
```sql
SELECT * FROM get_videos_stats();
```

### Recherche full-text
```sql
SELECT title, status, category
FROM videos 
WHERE to_tsvector('french', title || ' ' || coalesce(prompt, '')) 
      @@ plainto_tsquery('french', 'N8N automatisation');
```

### Vidéos enrichies par l'IA
```sql
SELECT title, enriched_with_search, last_search_update
FROM videos 
WHERE enriched_with_search = true
ORDER BY last_search_update DESC;
```

## 🔄 Mise à jour de la table

Si vous avez besoin d'ajouter des colonnes :

```sql
-- Exemple : Ajouter un champ pour les tags
ALTER TABLE videos ADD COLUMN tags TEXT[];

-- Ajouter un index pour les tags
CREATE INDEX idx_videos_tags ON videos USING gin(tags);
```

## 🛠️ Intégration avec l'agent de recherche

La table est prête pour l'intégration avec **Brave Search** :

- **`research_data`** : Stockage des résultats de recherche en JSON
- **`search_keywords`** : Mots-clés extraits automatiquement
- **`enriched_with_search`** : Flag pour identifier les vidéos enrichies
- **`last_search_update`** : Horodatage des mises à jour

### Exemple de données `research_data` :
```json
{
  "research_summary": {
    "key_points": ["Point clé 1", "Point clé 2"],
    "content_suggestions": ["Suggestion 1", "Suggestion 2"],
    "trending_topics": ["Tendance 1", "Tendance 2"]
  },
  "sources": [
    {
      "title": "Documentation N8N",
      "url": "https://docs.n8n.io",
      "relevance_score": 0.95
    }
  ]
}
```

## 🚨 Dépannage

### Erreur "relation does not exist"
- Vérifiez que le script SQL a été exécuté complètement
- Vérifiez les permissions de votre utilisateur Supabase

### Erreur de connexion
- Vérifiez votre `SUPABASE_URL`
- Vérifiez votre `SUPABASE_SERVICE_ROLE_KEY`
- Testez la connexion avec : `python -c "from services.videos_service import videos_service; print('OK')"`

### Problèmes de performance
- Les index sont créés automatiquement
- Pour de gros volumes, ajoutez des index personnalisés selon vos requêtes

## 📈 Évolutions prévues

- 🔄 **Cache Redis** pour les requêtes fréquentes
- 📊 **Analytics avancées** avec des métriques personnalisées
- 🔗 **Intégration YouTube API** pour la synchronisation
- 🤖 **IA de recommandation** basée sur l'historique
- 🌐 **Multi-tenant** pour plusieurs utilisateurs

---

✨ **Votre table vidéos est maintenant prête pour révolutionner votre workflow de création de contenu !** 