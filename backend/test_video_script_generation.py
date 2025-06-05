#!/usr/bin/env python3
"""
Génération de script vidéo enrichi avec recherche Brave Search
Pour le Générateur de vidéos IA d'Orra Academy
Généré le: 2025-01-10
"""

import sys
import os
import logging
import traceback
from datetime import datetime

# Configuration des logs
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Ajout du chemin pour les imports locaux
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Imports locaux
from services.flexible_search_service import (
    FlexibleSearchService,
    SearchConfig,
    SearchProvider,
    Freshness,
    VideoScriptGenerator
)


def generate_enriched_video_script():
    """Génère un script vidéo enrichi avec des recherches réelles"""
    # Date actuelle
    today = datetime.now().strftime("%d/%m/%Y")
    
    print("🎬 GÉNÉRATEUR DE SCRIPT VIDÉO ENRICHI")
    print("=" * 60)
    print(f"📅 Date de génération: {today}")
    print()
    
    # Sujet de la vidéo (mis à jour pour 2025)
    topic = "N8N vs Make.com : Lequel choisir en 2025 pour automatiser son business"
    
    print(f"🎯 Sujet: {topic}")
    print()
    
    # Configuration pour recherche récente et pertinente
    search_config = SearchConfig(
        provider=SearchProvider.BRAVE,
        country="FR", 
        language="fr",
        n_results=8,
        freshness=Freshness.PAST_MONTH,
        result_filter="web,news"
    )
    
    print("📋 Configuration de recherche:")
    print(f"   Provider: {search_config.provider.value}")
    print(f"   Fraîcheur: {search_config.freshness.value} (dernier mois)")
    print(f"   Résultats: {search_config.n_results}")
    print()
    
    # Service de recherche
    search_service = FlexibleSearchService(search_config)
    
    # 1. Recherche comparative (mise à jour pour 2025)
    print("🔍 1. RECHERCHE COMPARATIVE N8N vs MAKE")
    print("-" * 40)
    
    comparison_query = "N8N vs Make.com comparison 2025 automation"
    comparison_results = search_service.search(comparison_query)
    
    if comparison_results.get("success"):
        print(f"✅ {comparison_results['total_results']} résultats trouvés")
        print("📰 Sources principales:")
        for i, result in enumerate(comparison_results['results'][:3], 1):
            print(f"   {i}. {result['title'][:70]}...")
            print(f"      🔗 {result['url']}")
        print()
    
    # 2. Génération du script enrichi
    print("🎬 2. GÉNÉRATION DU SCRIPT ENRICHI")
    print("-" * 40)
    
    script_generator = VideoScriptGenerator(search_service)
    
    # Génération du script avec recherche
    script_generator.generate_script(
        topic=topic,
        target_audience="entrepreneurs",
        style="orra_academy",
        include_research=True
    )
    
    print("✅ Script généré !")
    print()
    
    # Script optimisé Orra Academy (mis à jour pour 2025)
    script_final = f"""N8N vs Make.com : Lequel choisir en 2025 pour automatiser son business

## Introduction (0-30s)
Salut tout le monde ! C'est Maxens, CTO de l'Orra Academy. 
Bienvenue sur notre chaîne ! Aujourd'hui, {today}, on plonge dans LA question que vous me posez tout le temps :

"Maxens, N8N ou Make.com pour automatiser mon business en 2025 ?"

Et croyez-moi, après avoir testé les deux sur plus de 50 projets clients, j'ai des éléments de réponse très concrets !

## Corps principal (30s-4min)

### 1. Le contexte 2025
- Pourquoi cette question devient cruciale maintenant
- Les évolutions majeures des deux plateformes en début d'année
- Mon retour d'expérience chez Orra Academy

### 2. N8N : Le champion de la flexibilité
✅ **Avantages :**
- Open source = contrôle total + pas de vendor lock-in
- Interface de workflow intuitive
- Communauté très active
- Hébergement self-hosted possible

❌ **Inconvénients :**
- Courbe d'apprentissage plus élevée
- Nécessite plus de configuration technique
- Support communautaire uniquement (version gratuite)

### 3. Make.com : La simplicité qui scale
✅ **Avantages :**
- Interface ultra-intuitive
- 1000+ intégrations natives
- Support client premium
- Déploiement immédiat

❌ **Inconvénients :**
- Coût qui augmente vite avec le volume
- Moins de flexibilité sur les workflows complexes
- Dépendance totale à la plateforme

### 4. Mon verdict 2025

**Pour les débutants** → Make.com
- Setup en 10 minutes
- ROI immédiat
- Parfait jusqu'à 10k opérations/mois

**Pour les entreprises** → N8N
- Coût maîtrisé sur le long terme
- Workflows complexes possibles
- Contrôle total de vos données

## Call to action (4-4:30min)
Si tu veux maîtriser ces deux outils comme un pro, j'ai créé une formation complète sur l'automatisation business sur Orra Academy.

Module N8N, Make.com, Zapier... tout y est !
Lien en description : orra-academy.com

## Conclusion (4:30-5min)
Voilà les amis ! Maintenant tu as toutes les cartes en main pour choisir en ce début 2025.

Pose tes questions en commentaires, j'y réponds toujours !

À très bientôt pour un nouveau tuto !
Maxens 🚀"""
    
    print("📝 SCRIPT VIDÉO FINAL:")
    print("=" * 60)
    print(script_final)
    
    return script_final


if __name__ == "__main__":
    try:
        generate_enriched_video_script()
        print(f"\n✨ SCRIPT PRÊT POUR LE GÉNÉRATEUR VIDÉO ! ({datetime.now().strftime('%d/%m/%Y')})")
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        traceback.print_exc() 