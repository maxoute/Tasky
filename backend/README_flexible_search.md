# Service de Recherche Flexible

> Inspiré de l'approche CrewAI BraveSearchTool - Simple, configurable et puissant

## 🎯 Vue d'ensemble

Le Service de Recherche Flexible est conçu pour offrir une interface modulaire et configurable pour effectuer des recherches web. Inspiré par l'architecture de CrewAI BraveSearchTool, il permet une utilisation simple par défaut avec des possibilités d'extension avancées.

## ✨ Fonctionnalités

- **🚀 Recherche rapide** : Interface simple pour des besoins basiques
- **⚙️ Configuration avancée** : Contrôle total sur tous les paramètres
- **📈 Analyse de tendances** : Analyseur spécialisé pour identifier les tendances
- **🎬 Génération de scripts** : Création automatique de scripts vidéo personnalisés
- **📦 Recherche en batch** : Traitement de plusieurs requêtes simultanément
- **🎨 Presets prédéfinis** : Configurations prêtes à l'emploi
- **💾 Sauvegarde automatique** : Archivage optionnel des résultats

## 🚀 Installation

```bash
# Installer les dépendances
pip install requests python-dotenv

# Configurer la clé API
export BRAVE_API_KEY="your_brave_api_key_here"
```

## 📖 Utilisation

### 1. Recherche Rapide (Style CrewAI)

```python
from services.flexible_search_service import QuickSearch

# Recherche simple et rapide
results = QuickSearch.search("N8N automation tutorial", n_results=5)
print(f"Trouvé {len(results)} résultats")
```

### 2. Configuration Avancée

```python
from services.flexible_search_service import (
    FlexibleSearchService, 
    SearchConfig, 
    Freshness, 
    SafeSearch
)

# Configuration personnalisée
config = SearchConfig(
    country="US",
    language="en", 
    n_results=15,
    freshness=Freshness.PAST_WEEK,
    safesearch=SafeSearch.MODERATE,
    save_file=True
)

service = FlexibleSearchService(config)
results = service.search("Make.com vs Zapier 2024")
```

### 3. Analyse de Tendances

```python
from services.flexible_search_service import FlexibleSearchService, TrendAnalyzer

search_service = FlexibleSearchService()
analyzer = TrendAnalyzer(search_service)

# Analyser les tendances pour un sujet
trends = analyzer.analyze_trends("IA")
print(f"Trouvé {trends['trends_found']} tendances")
```

### 4. Génération de Scripts Vidéo

```python
from services.flexible_search_service import FlexibleSearchService, VideoScriptGenerator

search_service = FlexibleSearchService()
script_gen = VideoScriptGenerator(search_service)

# Générer un script personnalisé
script_data = script_gen.generate_script(
    topic="MAKE pour les débutants",
    target_audience="débutants",
    style="orra_academy",
    include_research=True
)

print(script_data['script'])
```

## 🌐 API REST

### Endpoints Disponibles

#### 1. Recherche Rapide
```http
POST /api/search/quick
Content-Type: application/json

{
  "query": "N8N tutorial",
  "country": "FR",
  "n_results": 10
}
```

#### 2. Recherche Avancée
```http
POST /api/search/advanced
Content-Type: application/json

{
  "query": "Make.com automation",
  "country": "US",
  "language": "en",
  "n_results": 15,
  "freshness": "pw",
  "safesearch": "moderate",
  "save_file": true
}
```

#### 3. Analyse de Tendances
```http
GET /api/search/trends/IA?n_results=20
```

#### 4. Génération de Script
```http
POST /api/search/generate-script
Content-Type: application/json

{
  "topic": "MAKE pour les débutants",
  "target_audience": "débutants",
  "style": "orra_academy",
  "include_research": true
}
```

#### 5. Presets Prédéfinis
```http
GET /api/search/presets/news?query=intelligence artificielle
GET /api/search/presets/tutorials?query=Python automation
GET /api/search/presets/academic?query=machine learning
```

#### 6. Recherche en Batch
```http
POST /api/search/batch
Content-Type: application/json

{
  "queries": ["N8N tutorial", "Make.com guide", "Zapier automation"],
  "config": {
    "country": "FR",
    "n_results": 5
  }
}
```

## ⚙️ Configuration

### SearchConfig Options

| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| `provider` | `SearchProvider` | `BRAVE` | Provider de recherche |
| `country` | `str` | `"FR"` | Code pays (FR, US, etc.) |
| `language` | `str` | `"fr"` | Langue de recherche |
| `n_results` | `int` | `10` | Nombre de résultats (max 20) |
| `freshness` | `Freshness` | `PAST_MONTH` | Fraîcheur des résultats |
| `safesearch` | `SafeSearch` | `MODERATE` | Niveau SafeSearch |
| `result_filter` | `str` | `"web,news"` | Types de résultats |
| `save_file` | `bool` | `False` | Sauvegarde automatique |

### Énumérations

#### Freshness
- `PAST_DAY` ("pd") - Dernières 24h
- `PAST_WEEK` ("pw") - Dernière semaine  
- `PAST_MONTH` ("pm") - Dernier mois
- `PAST_YEAR` ("py") - Dernière année
- `ALL_TIME` ("") - Tous temps

#### SafeSearch
- `OFF` ("off") - Désactivé
- `MODERATE` ("moderate") - Modéré
- `STRICT` ("strict") - Strict

## 🎨 Presets Prédéfinis

| Preset | Usage | Configuration |
|--------|-------|---------------|
| `news` | Actualités récentes | 24h, filter=news |
| `tutorials` | Tutoriels | 1 mois, filter=web |
| `academic` | Recherche académique | 1 an, save_file=true |
| `international` | Résultats US/anglais | country=US, lang=en |
| `recent` | Contenu récent | 1 semaine |

## 🔧 Classes Utilitaires

### QuickSearch
Interface simplifiée pour des recherches rapides.

```python
from services.flexible_search_service import QuickSearch

# Recherche ultra-simple
results = QuickSearch.search("Python automation")
```

### TrendAnalyzer  
Analyseur spécialisé pour identifier les tendances.

```python
analyzer = TrendAnalyzer(search_service)
trends = analyzer.analyze_trends("IA")
```

### VideoScriptGenerator
Générateur de scripts vidéo personnalisés.

```python
script_gen = VideoScriptGenerator(search_service)
script = script_gen.generate_script("Make.com tutorial")
```

## 🚀 Exemples d'Usage

### Cas d'Usage 1 : Newsletter Automatique
```python
# Rechercher les dernières actualités IA
news_config = SearchConfig(
    freshness=Freshness.PAST_DAY,
    result_filter="news",
    n_results=10
)

service = FlexibleSearchService(news_config)
news = service.search("intelligence artificielle")
```

### Cas d'Usage 2 : Recherche de Contenu Vidéo
```python
# Générer un script basé sur des recherches récentes
script_gen = VideoScriptGenerator(search_service)
script_data = script_gen.generate_script(
    topic="N8N automation 2024",
    target_audience="intermédiaires",
    include_research=True
)
```

### Cas d'Usage 3 : Veille Technologique
```python
# Analyser les tendances sur plusieurs sujets
analyzer = TrendAnalyzer(search_service)

topics = ["IA", "automation", "no-code"]
all_trends = {}

for topic in topics:
    all_trends[topic] = analyzer.analyze_trends(topic)
```

## 🔍 Comparaison avec CrewAI BraveSearchTool

| Aspect | CrewAI BraveSearchTool | Notre Service Flexible |
|--------|------------------------|------------------------|
| **Simplicité** | ✅ Interface simple | ✅ QuickSearch + presets |
| **Configuration** | ✅ Paramètres configurables | ✅ SearchConfig avancé |
| **Extensibilité** | ⚠️ Limité | ✅ Classes spécialisées |
| **Intégration agents** | ✅ Natif CrewAI | ✅ API REST + Python |
| **Sauvegarde** | ✅ Optionnelle | ✅ Avec métadonnées |
| **Batch processing** | ❌ Non supporté | ✅ Recherche en batch |
| **Analyse de tendances** | ❌ Non inclus | ✅ TrendAnalyzer |
| **Génération de contenu** | ❌ Non inclus | ✅ VideoScriptGenerator |

## 🎯 Avantages Clés

1. **Flexibilité maximale** : De la recherche simple à la configuration avancée
2. **Architecture modulaire** : Classes spécialisées pour différents besoins
3. **Compatible CrewAI** : Même simplicité d'usage
4. **Extensible** : Facile d'ajouter d'autres providers
5. **Production-ready** : Gestion d'erreurs, logging, validation
6. **Personnalisable** : Adaptable au profil Orra Academy

## 🔧 Développement

### Tester le Service
```bash
# Lancer la démonstration
python demo_flexible_search.py

# Tester via l'API
python -m uvicorn app:app --reload
```

### Ajouter un Provider
```python
class SearchProvider(Enum):
    BRAVE = "brave"
    GOOGLE = "google"  # Nouveau provider

# Implémenter _google_search() dans FlexibleSearchService
```

## 🚀 Prochaines Étapes

- [ ] Intégration Google Search API
- [ ] Support de la recherche d'images
- [ ] Cache intelligent des résultats
- [ ] Interface web React
- [ ] Intégration CrewAI native
- [ ] Metrics et analytics avancées

---

**🎯 Inspiré par l'excellence de CrewAI, optimisé pour Orra Academy** 🚀 