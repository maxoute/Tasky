#!/usr/bin/env python3
"""
🚀 DÉMONSTRATION FINALE : SERVICE DE RECHERCHE MULTI-PROVIDER

Montre toutes les capacités du service flexible avec support Brave + Google
Inspiré de CrewAI BraveSearchTool mais étendu et amélioré
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.flexible_search_service import (
    FlexibleSearchService,
    SearchConfig,
    SearchProvider,
    Freshness,
    SafeSearch,
    QuickSearch,
    TrendAnalyzer,
    VideoScriptGenerator
)

def banner():
    """Affiche le banner de démonstration"""
    print("🎯" + "=" * 70 + "🎯")
    print("🚀          SERVICE DE RECHERCHE FLEXIBLE - MULTI-PROVIDER          🚀")
    print("🎯" + "=" * 70 + "🎯")
    print("✨ Support: Brave Search + Google Custom Search")
    print("🔧 Interface: Style CrewAI, Configuration avancée")
    print("🎬 Fonctionnalités: Scripts vidéo, Analyse tendances, Batch search")
    print("🎯" + "=" * 70 + "🎯")

def demo_quick_search():
    """Démo de l'interface QuickSearch style CrewAI"""
    print("\n🚀 DEMO 1: INTERFACE QUICKSEARCH (Style CrewAI)")
    print("=" * 60)
    
    queries = [
        ("Python automation", "brave"),
        ("FastAPI tutorial", "google"),
        ("N8N workflows", "brave")
    ]
    
    for query, provider in queries:
        print(f"\n🔍 Recherche: '{query}' (Provider: {provider})")
        print("-" * 40)
        
        try:
            # Interface ultra simple
            if provider == "google":
                results = QuickSearch.search(query, n_results=3, provider="google")
            else:
                results = QuickSearch.search(query, n_results=3)
            
            if isinstance(results, dict) and results.get("success"):
                print(f"✅ {results['total_results']} résultats trouvés")
                print(f"⚡ Provider utilisé: {provider}")
                
                # Afficher le top 2
                for i, result in enumerate(results['results'][:2], 1):
                    print(f"{i}. {result['title'][:50]}...")
                    print(f"   🔗 {result['url']}")
            else:
                error_msg = results.get("error") if isinstance(results, dict) else "Format inattendu"
                print(f"❌ Erreur: {error_msg}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")

def demo_advanced_configs():
    """Démo des configurations avancées pour chaque provider"""
    print("\n⚙️ DEMO 2: CONFIGURATIONS AVANCÉES PAR PROVIDER")
    print("=" * 60)
    
    # Configuration Brave avancée
    print("\n🛡️ BRAVE SEARCH - Configuration Premium:")
    brave_config = SearchConfig(
        provider=SearchProvider.BRAVE,
        country="FR",
        language="fr",
        n_results=5,
        freshness=Freshness.PAST_WEEK,
        safesearch=SafeSearch.MODERATE,
        result_filter="web,news",
        save_file=True
    )
    
    print(f"   🌍 Pays: {brave_config.country}")
    print(f"   🗣️ Langue: {brave_config.language}")
    print(f"   📅 Fraîcheur: {brave_config.freshness}")
    print(f"   🔒 SafeSearch: {brave_config.safesearch}")
    print(f"   🎯 Filtres: {brave_config.result_filter}")
    
    # Test recherche Brave
    brave_service = FlexibleSearchService(brave_config)
    brave_results = brave_service.search("intelligence artificielle 2024")
    
    if brave_results.get("success"):
        print(f"   ✅ Résultats: {brave_results['total_results']}")
        print(f"   📝 Sauvegarde: {'✅' if brave_config.save_file else '❌'}")
    else:
        print(f"   ❌ Erreur: {brave_results.get('error')}")
    
    # Configuration Google avancée
    print("\n🔍 GOOGLE CUSTOM SEARCH - Configuration:")
    google_config = SearchConfig(
        provider=SearchProvider.GOOGLE,
        country="US",
        language="en",
        n_results=8,
        freshness=Freshness.PAST_MONTH,
        safesearch=SafeSearch.STRICT
    )
    
    print(f"   🌍 Pays: {google_config.country}")
    print(f"   🗣️ Langue: {google_config.language}")
    print(f"   📊 Résultats max: {google_config.n_results}")
    print(f"   📅 Fraîcheur: {google_config.freshness}")
    
    # Test recherche Google
    google_service = FlexibleSearchService(google_config)
    google_results = google_service.search("machine learning tutorials")
    
    if google_results.get("success"):
        print(f"   ✅ Résultats: {google_results['total_results']}")
        if google_results.get("provider_metadata"):
            print(f"   📊 Estimation totale: {google_results['provider_metadata']['total_results_estimate']}")
    else:
        print(f"   ❌ Erreur: {google_results.get('error')}")

def demo_trend_analysis():
    """Démo de l'analyse de tendances"""
    print("\n📈 DEMO 3: ANALYSE DE TENDANCES")
    print("=" * 60)
    
    topics = ["artificial intelligence", "automation tools", "FastAPI"]
    
    for topic in topics:
        print(f"\n🔍 Analyse: '{topic}'")
        print("-" * 30)
        
        try:
            analyzer = TrendAnalyzer()
            trends = analyzer.analyze_trends(topic, n_results=5)
            
            if trends.get("success"):
                print(f"✅ {len(trends['sources'])} sources analysées")
                print(f"🔥 Mots-clés populaires: {', '.join(trends['trending_keywords'][:5])}")
                print(f"📊 Score de tendance: {trends['trend_score']:.1f}/10")
                
                # Top source
                if trends['sources']:
                    top_source = trends['sources'][0]
                    print(f"📰 Top source: {top_source['title'][:40]}...")
            else:
                print(f"❌ Erreur: {trends.get('error')}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")

def demo_video_script_generation():
    """Démo de génération de scripts vidéo personnalisés"""
    print("\n🎬 DEMO 4: GÉNÉRATION DE SCRIPTS VIDÉO")
    print("=" * 60)
    
    topics = [
        ("Make vs Zapier", "comparison"),
        ("Python automation beginner", "tutorial"),
        ("N8N workflows advanced", "advanced")
    ]
    
    for topic, style in topics:
        print(f"\n🎥 Script: '{topic}' (Style: {style})")
        print("-" * 40)
        
        try:
            script_generator = VideoScriptGenerator()
            script = script_generator.generate_personalized_script(
                topic=topic,
                style=style,
                duration_minutes=3
            )
            
            if script.get("success"):
                print(f"✅ Script généré ({script['word_count']} mots)")
                print(f"🎯 Sources utilisées: {len(script['sources_analyzed'])}")
                print(f"📝 Hook: {script['script'][:100]}...")
                print(f"🏷️ Mots-clés: {', '.join(script['keywords'][:3])}")
            else:
                print(f"❌ Erreur: {script.get('error')}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")

def demo_provider_comparison():
    """Démo de comparaison directe entre providers"""
    print("\n⚖️ DEMO 5: COMPARAISON DIRECTE PROVIDERS")
    print("=" * 60)
    
    query = "React vs Vue.js 2024"
    
    print(f"🔍 Requête comparative: '{query}'")
    print("-" * 40)
    
    # Configuration identique pour les deux
    base_config = {
        "country": "US",
        "language": "en", 
        "n_results": 5,
        "freshness": Freshness.PAST_MONTH
    }
    
    # Test Brave
    print("\n🛡️ BRAVE SEARCH:")
    brave_config = SearchConfig(provider=SearchProvider.BRAVE, **base_config)
    brave_service = FlexibleSearchService(brave_config)
    brave_results = brave_service.search(query)
    
    if brave_results.get("success"):
        print(f"   ✅ {brave_results['total_results']} résultats")
        print(f"   ⚡ Source: {brave_results['results'][0]['source'] if brave_results['results'] else 'N/A'}")
        unique_domains_brave = len(set(r['url'].split('/')[2] for r in brave_results['results'] if r.get('url')))
        print(f"   🌐 Domaines uniques: {unique_domains_brave}")
    else:
        print(f"   ❌ Erreur: {brave_results.get('error')}")
    
    # Test Google
    print("\n🔍 GOOGLE CUSTOM SEARCH:")
    google_config = SearchConfig(provider=SearchProvider.GOOGLE, **base_config)
    google_service = FlexibleSearchService(google_config)
    google_results = google_service.search(query)
    
    if google_results.get("success"):
        print(f"   ✅ {google_results['total_results']} résultats")
        print(f"   ⚡ Source: {google_results['results'][0]['source'] if google_results['results'] else 'N/A'}")
        unique_domains_google = len(set(r['url'].split('/')[2] for r in google_results['results'] if r.get('url')))
        print(f"   🌐 Domaines uniques: {unique_domains_google}")
        
        if google_results.get("provider_metadata"):
            print(f"   📊 Estimation: {google_results['provider_metadata']['total_results_estimate']}")
    else:
        print(f"   ❌ Erreur: {google_results.get('error')}")

def demo_error_handling():
    """Démo de la gestion d'erreurs et fallback"""
    print("\n🛟 DEMO 6: GESTION D'ERREURS & FALLBACK")
    print("=" * 60)
    
    print("🧪 Test de résilience:")
    
    # Test provider invalide
    print("\n1. Provider invalide:")
    try:
        invalid_config = SearchConfig(provider="bing")  # Provider non supporté
        service = FlexibleSearchService(invalid_config)
        print("   ❌ Devrait lever une erreur")
    except Exception as e:
        print(f"   ✅ Erreur capturée: {type(e).__name__}")
    
    # Test requête vide
    print("\n2. Requête vide:")
    config = SearchConfig(provider=SearchProvider.BRAVE)
    service = FlexibleSearchService(config)
    result = service.search("")
    print(f"   {'✅ Erreur détectée' if result.get('error') else '❌ Devrait échouer'}")
    
    # Test strategy de fallback
    print("\n3. Stratégie de fallback:")
    def search_with_fallback(query):
        providers = [SearchProvider.GOOGLE, SearchProvider.BRAVE]
        
        for provider in providers:
            try:
                config = SearchConfig(provider=provider, n_results=3)
                service = FlexibleSearchService(config)
                result = service.search(query)
                
                if result.get("success"):
                    return {"provider": provider.value, "results": result}
            except Exception:
                continue
        
        return {"error": "Tous les providers ont échoué"}
    
    fallback_result = search_with_fallback("Python tutorial")
    if fallback_result.get("provider"):
        print(f"   ✅ Fallback réussi avec: {fallback_result['provider']}")
    else:
        print(f"   ⚠️ Fallback échoué: {fallback_result.get('error')}")

def show_final_summary():
    """Affiche le résumé final des capacités"""
    print("\n🎊 RÉSUMÉ FINAL - CAPACITÉS DU SERVICE")
    print("=" * 60)
    
    print("✨ PROVIDERS SUPPORTÉS:")
    print("   🛡️ Brave Search API - Privacy-focused, filtres avancés")
    print("   🔍 Google Custom Search - Index Google, 100 requêtes/jour gratuites")
    
    print("\n🚀 INTERFACES DISPONIBLES:")
    print("   ⚡ QuickSearch - Interface simple style CrewAI")
    print("   ⚙️ FlexibleSearchService - Configuration avancée")
    print("   📈 TrendAnalyzer - Analyse de tendances")
    print("   🎬 VideoScriptGenerator - Scripts personnalisés")
    
    print("\n🛠️ FONCTIONNALITÉS CLÉS:")
    print("   🔄 Multi-provider avec fallback automatique")
    print("   🌍 Support international (pays + langues)")
    print("   📅 Filtrage par fraîcheur")
    print("   🔒 Contrôle SafeSearch")
    print("   💾 Sauvegarde optionnelle")
    print("   📊 Métadonnées enrichies")
    print("   🎯 Filtres de contenu personnalisés")
    
    print("\n🔗 API REST ENDPOINTS:")
    print("   POST /api/search/quick - Recherche rapide")
    print("   POST /api/search/advanced - Configuration complète")
    print("   GET /api/search/trends/{topic} - Analyse tendances")
    print("   POST /api/search/generate-script - Scripts vidéo")
    print("   POST /api/search/batch - Recherche multiple")
    
    print("\n💡 AVANTAGES vs CrewAI BraveSearchTool:")
    print("   ✅ Multi-provider (CrewAI = Brave uniquement)")
    print("   ✅ Analyse de tendances (CrewAI = Non)")
    print("   ✅ Génération de contenu (CrewAI = Non)")
    print("   ✅ API REST complète (CrewAI = Non)")
    print("   ✅ Batch processing (CrewAI = Non)")
    print("   ✅ Presets configurables (CrewAI = Non)")

if __name__ == "__main__":
    banner()
    
    try:
        demo_quick_search()
        demo_advanced_configs()
        demo_trend_analysis()
        demo_video_script_generation()
        demo_provider_comparison()
        demo_error_handling()
        show_final_summary()
        
        print("\n🎯" + "=" * 70 + "🎯")
        print("🚀                    DÉMONSTRATION TERMINÉE                      🚀")
        print("🎯" + "=" * 70 + "🎯")
        print("💫 Service de recherche flexible opérationnel avec support multi-provider!")
        
    except KeyboardInterrupt:
        print("\n⏹️ Démonstration interrompue par l'utilisateur")
    except Exception as e:
        print(f"\n❌ Erreur inattendue: {e}")
        import traceback
        traceback.print_exc() 