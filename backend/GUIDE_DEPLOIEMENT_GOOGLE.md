# 🚀 Guide de Déploiement : Google Custom Search API

## ⚡ Configuration Rapide (5 minutes)

### 1. **Google Cloud Console**
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou sélectionner un existant
3. Activer l'API "Custom Search JSON API"
4. Aller dans "Credentials" → "Create Credentials" → "API Key"
5. Copier votre API Key

### 2. **Moteur de Recherche Personnalisé**
1. Aller sur [cse.google.com](https://cse.google.com/)
2. Cliquer "Add" pour créer un nouveau moteur
3. **Sites à rechercher** : Entrer `*` pour rechercher sur tout le web
4. Nommer votre moteur (ex: "Orra Academy Search")
5. Cliquer "Create"
6. Dans la section "Basics", copier votre **Search Engine ID** (cx)

### 3. **Variables d'Environnement**
```bash
# Ajouter dans votre .env ou bashrc
export GOOGLE_API_KEY="AIzaSy..."
export GOOGLE_SEARCH_ENGINE_ID="017576662512468239146:..."

# Vérifier que c'est chargé
echo $GOOGLE_API_KEY
echo $GOOGLE_SEARCH_ENGINE_ID
```

## 🧪 Test Rapide

```python
from services.flexible_search_service import FlexibleSearchService, SearchConfig, SearchProvider

# Configuration Google
google_config = SearchConfig(
    provider=SearchProvider.GOOGLE,
    n_results=5
)

# Test
service = FlexibleSearchService(google_config)
results = service.search("Python tutorial")

print(f"✅ Résultats: {results['total_results']}")
```

## 📊 Limites et Quotas

### **Plan Gratuit Google**
- ✅ **100 requêtes/jour** gratuit
- ✅ **10 résultats max** par requête
- ✅ **Pas de limite de moteurs** de recherche

### **Optimisation Usage**
```python
# Stratégie cost-effective
def search_optimized(query):
    # Google d'abord (gratuit)
    try:
        google_config = SearchConfig(provider=SearchProvider.GOOGLE)
        return FlexibleSearchService(google_config).search(query)
    except Exception:
        # Fallback Brave (payant mais plus de résultats)
        brave_config = SearchConfig(provider=SearchProvider.BRAVE)
        return FlexibleSearchService(brave_config).search(query)
```

## 🔧 Configuration Avancée

### **Personnalisation du Moteur**
Dans [cse.google.com](https://cse.google.com/) :

1. **Sites privilégiés** : Ajouter des domaines spécifiques
   ```
   site:stackoverflow.com
   site:github.com
   site:docs.python.org
   ```

2. **Filtres de langue** : Configurer les langues supportées

3. **SafeSearch** : Définir le niveau de filtrage par défaut

### **Paramètres Avancés**
```python
google_config = SearchConfig(
    provider=SearchProvider.GOOGLE,
    country="FR",           # Code pays
    language="fr",          # Langue de recherche  
    n_results=8,           # Max 10 pour Google
    freshness=Freshness.PAST_WEEK,  # Filtrage temporel
    safesearch=SafeSearch.MODERATE   # Contrôle contenu
)
```

## 🚨 Résolution de Problèmes

### **Erreur: API Key Invalid**
```bash
# Vérifier que l'API est activée
gcloud services enable customsearch.googleapis.com

# Tester avec curl
curl "https://www.googleapis.com/customsearch/v1?key=YOUR_KEY&cx=YOUR_CX&q=test"
```

### **Erreur: Search Engine ID Invalid**
- Vérifier que le moteur est configuré pour "Search the entire web"
- S'assurer que l'ID commande bien par des chiffres + ":"

### **Quota Dépassé**
```json
{
  "error": {
    "code": 429,
    "message": "Quota exceeded"
  }
}
```
**Solution :** Implémenter le fallback vers Brave ou attendre le reset quotidien.

## 🎯 Cas d'Usage Orra Academy

### **1. Recherche de Contenu Pédagogique**
```python
education_config = SearchConfig(
    provider=SearchProvider.GOOGLE,
    language="fr",
    n_results=10,
    freshness=Freshness.PAST_YEAR
)

results = service.search("machine learning cours français")
```

### **2. Veille Technologique**
```python
tech_config = SearchConfig(
    provider=SearchProvider.GOOGLE,
    language="en", 
    freshness=Freshness.PAST_WEEK,
    n_results=5
)

trends = service.search("AI trends 2024")
```

### **3. Scripts Vidéo Enrichis**
```python
from services.flexible_search_service import VideoScriptGenerator

generator = VideoScriptGenerator()
script = generator.generate_personalized_script(
    topic="N8N automation beginner",
    style="orra_academy",
    search_provider=SearchProvider.GOOGLE  # Sources Google + Brave
)
```

## ⚖️ Brave vs Google : Quand Utiliser Quoi

### **Utiliser Google Custom Search pour :**
- ✅ Recherche généraliste large
- ✅ Contenus académiques/éducatifs  
- ✅ Documentation technique
- ✅ Budget limité (100/jour gratuit)
- ✅ Métadonnées riches (temps de recherche, estimation)

### **Utiliser Brave Search pour :**
- ✅ Privacy et anonymat
- ✅ Plus de résultats par requête (20 vs 10)
- ✅ Actualités récentes
- ✅ Recherche alternative sans Google
- ✅ Volume élevé de requêtes

## 🔄 Migration et Fallback

### **Configuration Automatique**
```python
def get_best_provider():
    """Sélectionne automatiquement le meilleur provider"""
    if os.getenv('GOOGLE_API_KEY') and daily_quota_available():
        return SearchProvider.GOOGLE
    elif os.getenv('BRAVE_API_KEY'):
        return SearchProvider.BRAVE
    else:
        raise Exception("Aucun provider configuré")

# Usage
config = SearchConfig(provider=get_best_provider())
```

---

**🎊 Résultat :** Google Custom Search intégré et opérationnel dans votre service flexible multi-provider pour l'Orra Academy ! 