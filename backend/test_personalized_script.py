#!/usr/bin/env python3
"""
Script de test pour la génération de scripts vidéo personnalisés
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.brave_search_service import brave_search_service
import json

def test_personalized_script_generation():
    """Test de génération d'un script personnalisé"""
    
    print("🎬 Test de génération de script personnalisé")
    print("=" * 50)
    
    # Test avec le sujet "MAKE pour les débutants"
    topic = "MAKE pour les débutants"
    audience = "débutants"
    
    print(f"📝 Génération du script pour: {topic}")
    print(f"🎯 Public cible: {audience}")
    print("\n⏳ Recherche en cours...")
    
    try:
        # Générer le script personnalisé
        result = brave_search_service.generate_personalized_video_script(
            topic=topic,
            target_audience=audience
        )
        
        if "error" in result:
            print(f"❌ Erreur: {result['error']}")
            return
        
        print("\n✅ Script généré avec succès !")
        print("=" * 50)
        
        # Afficher le script
        print("\n📄 SCRIPT GÉNÉRÉ:")
        print(result["script"])
        
        print("\n" + "=" * 50)
        print("📊 DONNÉES DE RECHERCHE:")
        
        research_data = result.get("research_data", {})
        
        print(f"🔍 Sources utilisées: {research_data.get('sources_count', 0)}")
        print(f"🔑 Mots-clés trouvés: {len(research_data.get('key_points', []))}")
        print(f"📈 Tendances analysées: {len(research_data.get('trends', []))}")
        
        if research_data.get('key_points'):
            print(f"\n🏷️ Mots-clés principaux:")
            for i, kp in enumerate(research_data['key_points'][:5], 1):
                print(f"   {i}. {kp}")
        
        if research_data.get('content_suggestions'):
            print(f"\n💡 Suggestions de contenu:")
            for i, suggestion in enumerate(research_data['content_suggestions'][:3], 1):
                print(f"   {i}. {suggestion}")
        
        print(f"\n🕒 Généré le: {result.get('generated_at', 'N/A')}")
        
    except Exception as e:
        print(f"❌ Erreur lors de la génération: {e}")

def compare_with_generic_script():
    """Compare avec un script générique pour montrer la différence"""
    
    print("\n" + "🔄 COMPARAISON AVEC SCRIPT GÉNÉRIQUE")
    print("=" * 50)
    
    generic_script = """# Script pour "MAKE pour les débutants"

## Introduction (0-30s)
Salut tout le monde ! Bienvenue sur Orra Academy. Aujourd'hui, on va aborder make pour les débutants.

## Corps principal (30s-3min)
- Point 1 : Comprendre les fondamentaux
- Point 2 : Mise en pratique avec des exemples concrets
- Point 3 : Cas d'usage professionnels
- Point 4 : Bonnes pratiques et astuces
- Point 5 : Erreurs courantes à éviter

## Call to action (3-3:30min)
Si cette vidéo vous a plu, n'oubliez pas de vous abonner et de rejoindre notre formation complète sur orra-academy.com !

## Conclusion (3:30-4min)
À bientôt pour la prochaine vidéo sur Orra Academy !"""

    print("📝 SCRIPT GÉNÉRIQUE (AVANT):")
    print(generic_script)
    
    print("\n❌ Problèmes du script générique:")
    print("   - Pas de personnalisation avec le profil de Maxens")
    print("   - Aucun contenu basé sur des recherches récentes")
    print("   - Points très vagues et non spécifiques")
    print("   - Pas de mention des tendances actuelles")
    print("   - Ton impersonnel")

if __name__ == "__main__":
    print("🚀 DÉMONSTRATION DE LA GÉNÉRATION DE SCRIPTS PERSONNALISÉS")
    print("=" * 60)
    
    # Afficher d'abord le problème avec le script générique
    compare_with_generic_script()
    
    print("\n" + "🎯 SOLUTION: GÉNÉRATION PERSONNALISÉE")
    print("=" * 60)
    
    # Tester la génération personnalisée
    test_personalized_script_generation()
    
    print("\n" + "✨ AVANTAGES DE LA PERSONNALISATION:")
    print("=" * 60)
    print("   ✅ Contenu basé sur des recherches en temps réel")
    print("   ✅ Personnalisation avec le profil de Maxens/Ryan")
    print("   ✅ Mention des tendances actuelles")
    print("   ✅ Ton personnel et authentique")
    print("   ✅ Références à l'Orra Academy intégrées naturellement")
    print("   ✅ Contenu spécifique au public cible")
    print("   ✅ Suggestions basées sur des données réelles") 