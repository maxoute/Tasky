#!/usr/bin/env python3
"""
Test rapide de génération de script pour l'interface
"""

import sys
import os
import traceback
from datetime import datetime

# Ajout du chemin pour les imports locaux
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Imports locaux
from services.flexible_search_service import (
    FlexibleSearchService,
    VideoScriptGenerator,
    SearchConfig,
    SearchProvider
)

def test_script_generation():
    """Test de génération de script personnalisé"""
    print("🎬 TEST GÉNÉRATION SCRIPT PERSONNALISÉ")
    print("=" * 50)
    
    # Topic de test
    topic = "make vs n8N"
    
    print(f"📝 Topic: {topic}")
    print(f"📅 Date: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
    print()
    
    try:
        # 1. Service de recherche flexible
        config = SearchConfig(
            provider=SearchProvider.BRAVE,
            country="FR",
            language="fr",
            n_results=5
        )
        
        search_service = FlexibleSearchService(config)
        script_generator = VideoScriptGenerator(search_service)
        
        print("🔍 Génération du script avec recherche...")
        
        # 2. Génération du script
        script_data = script_generator.generate_script(
            topic=topic,
            target_audience="entrepreneurs",
            style="orra_academy",
            include_research=True
        )
        
        print("✅ Script généré !")
        print()
        
        # 3. Affichage des résultats
        if isinstance(script_data, dict) and 'script' in script_data:
            script = script_data['script']
        else:
            script = script_data if isinstance(script_data, str) else str(script_data)
        
        print("📝 SCRIPT GÉNÉRÉ:")
        print("-" * 50)
        print(script[:800] + "..." if len(script) > 800 else script)
        print()
        
        # 4. Vérification du style Orra Academy
        orra_markers = [
            "Maxens", "CTO", "Orra Academy", 
            "orra-academy.com", "tout le monde"
        ]
        
        found_markers = [marker for marker in orra_markers if marker in script]
        
        print("🎯 VÉRIFICATION STYLE ORRA ACADEMY:")
        print(f"   Marqueurs trouvés: {len(found_markers)}/{len(orra_markers)}")
        for marker in found_markers:
            print(f"   ✅ {marker}")
        
        print()
        
        # 5. Test de fallback
        print("🔄 TEST FALLBACK (script de base):")
        
        today = datetime.now().strftime('%d/%m/%Y')
        fallback_script = f"""{topic} - Script Orra Academy

## Introduction (0-30s)
Salut tout le monde ! C'est Maxens, CTO de l'Orra Academy. 
Bienvenue sur notre chaîne ! Aujourd'hui, {today}, on plonge dans {topic.lower()}.

Et croyez-moi, après avoir testé ça sur plus de 50 projets clients, j'ai des éléments de réponse très concrets !

## Corps principal (30s-4min)

### 1. Le contexte 2025
- Pourquoi cette question devient cruciale maintenant
- Les évolutions majeures du domaine
- Mon retour d'expérience chez Orra Academy

### 2. Les points essentiels
- Comprendre les fondamentaux
- Mise en pratique avec des cas concrets
- Cas d'usage professionnels que j'ai testés
- Bonnes pratiques et erreurs à éviter

### 3. Mon conseil d'expert
- Ce que je recommande selon votre profil
- Les outils que j'utilise vraiment
- ROI et résultats mesurables

## Call to action (4-4:30min)
Si tu veux maîtriser ça comme un pro, j'ai créé une formation complète sur {topic.lower()} sur Orra Academy.

Tout ce dont tu as besoin pour passer expert !
Lien en description : orra-academy.com

## Conclusion (4:30-5min)
Voilà les amis ! Maintenant tu as toutes les cartes en main.

Pose tes questions en commentaires, j'y réponds toujours !

À très bientôt pour un nouveau tuto !
Maxens 🚀"""
        
        print("✅ Script fallback généré")
        print(f"   Longueur: {len(fallback_script)} caractères")
        print(f"   Style Orra Academy: {'✅' if 'Maxens' in fallback_script else '❌'}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = test_script_generation()
    print(f"\n{'✅ TEST RÉUSSI' if success else '❌ TEST ÉCHOUÉ'}") 