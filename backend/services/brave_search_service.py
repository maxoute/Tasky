import os
import requests
import json
from typing import Dict, List, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


class BraveSearchService:
    """Service pour effectuer des recherches avec l'API Brave Search"""
    
    def __init__(self):
        self.api_key = os.getenv('BRAVE_API_KEY')
        self.base_url = "https://api.search.brave.com/res/v1/web/search"
        
        # Configuration webhook N8N
        self.n8n_webhook_url = os.getenv('N8N_WEBHOOK_URL')
        self.n8n_enabled = os.getenv('N8N_WEBHOOK_ENABLED', 'false').lower() == 'true'
        
        if not self.api_key:
            logger.warning("BRAVE_API_KEY non trouvée dans les variables d'environnement")
        
        if self.n8n_enabled and not self.n8n_webhook_url:
            logger.warning("N8N_WEBHOOK_URL non trouvée mais webhook activé")
    
    def send_to_n8n(self, data: Dict[str, Any], event_type: str = "brave_search_result") -> Dict[str, Any]:
        """
        Envoie les données vers N8N via webhook
        
        Args:
            data: Données à envoyer
            event_type: Type d'événement (brave_search_result, video_script_generated, etc.)
        
        Returns:
            Dict avec le statut de l'envoi
        """
        if not self.n8n_enabled:
            logger.info("Webhook N8N désactivé")
            return {"status": "disabled", "message": "Webhook N8N désactivé"}
        
        if not self.n8n_webhook_url:
            logger.error("URL webhook N8N manquante")
            return {"status": "error", "message": "URL webhook N8N manquante"}
        
        # Préparer les données pour N8N
        webhook_payload = {
            "event_type": event_type,
            "timestamp": datetime.now().isoformat(),
            "source": "brave_search_service",
            "data": data,
            "metadata": {
                "generated_by": "Orra Academy - Brave Search Service",
                "version": "1.0"
            }
        }
        
        try:
            logger.info(f"Envoi vers N8N: {event_type}")
            
            headers = {
                "Content-Type": "application/json",
                "User-Agent": "Orra-Academy-BraveSearch/1.0"
            }
            
            response = requests.post(
                self.n8n_webhook_url,
                json=webhook_payload,
                headers=headers,
                timeout=30
            )
            
            response.raise_for_status()
            
            logger.info(f"Données envoyées avec succès vers N8N - Status: {response.status_code}")
            
            return {
                "status": "success",
                "status_code": response.status_code,
                "message": "Données envoyées vers N8N avec succès",
                "webhook_response": response.text if response.text else None
            }
            
        except requests.exceptions.Timeout:
            logger.error("Timeout lors de l'envoi vers N8N")
            return {"status": "error", "message": "Timeout webhook N8N"}
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Erreur webhook N8N: {e}")
            return {"status": "error", "message": f"Erreur webhook: {str(e)}"}
        
        except Exception as e:
            logger.error(f"Erreur inattendue webhook N8N: {e}")
            return {"status": "error", "message": f"Erreur inattendue: {str(e)}"}
    
    def search(self, 
               query: str,
               count: int = 10,
               country: str = "FR",
               search_lang: str = "fr",
               safesearch: str = "moderate",
               freshness: str = "pm",  # Last month
               result_filter: str = "web,news") -> Dict[str, Any]:
        """
        Effectue une recherche avec l'API Brave Search
        
        Args:
            query: Terme de recherche
            count: Nombre de résultats (max 20)
            country: Code pays (FR pour France)
            search_lang: Langue de recherche (fr)
            safesearch: Filtrage contenu adulte (off, moderate, strict)
            freshness: Fraîcheur des résultats (pd, pw, pm, py)
            result_filter: Types de résultats (web, news, videos, etc.)
        
        Returns:
            Dict contenant les résultats de recherche
        """
        if not self.api_key:
            return {"error": "API key Brave Search manquante"}
        
        # Paramètres de la requête
        params = {
            "q": query,
            "count": min(count, 20),
            "country": country,
            "search_lang": search_lang,
            "safesearch": safesearch,
            "freshness": freshness,
            "result_filter": result_filter,
            "text_decorations": True,
            "spellcheck": True
        }
        
        headers = {
            "Accept": "application/json",
            "Accept-Encoding": "gzip",
            "X-Subscription-Token": self.api_key
        }
        
        try:
            logger.info(f"Recherche Brave: {query}")
            response = requests.get(self.base_url, params=params, headers=headers)
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Erreur API Brave Search: {e}")
            return {"error": f"Erreur de requête: {str(e)}"}
        except json.JSONDecodeError as e:
            logger.error(f"Erreur décodage JSON: {e}")
            return {"error": "Réponse API invalide"}
    
    def search_for_video_content(self, video_prompt: str) -> Dict[str, Any]:
        """
        Recherche spécifique pour enrichir le contenu d'une vidéo
        
        Args:
            video_prompt: Prompt/sujet de la vidéo
        
        Returns:
            Dict avec les résultats formatés pour la création de vidéo
        """
        # Améliorer la requête pour des résultats plus pertinents
        enhanced_query = f"{video_prompt} tutoriel guide 2024"
        
        results = self.search(
            query=enhanced_query,
            count=15,
            freshness="pm",  # Dernier mois pour du contenu récent
            result_filter="web,news"
        )
        
        if "error" in results:
            return results
        
        # Extraire et formater les informations utiles
        formatted_results = self._format_video_research(results, video_prompt)
        
        # Envoyer vers N8N si activé
        webhook_result = self.send_to_n8n(
            data=formatted_results,
            event_type="video_content_research"
        )
        formatted_results["webhook_status"] = webhook_result
        
        return formatted_results
    
    def search_trends_and_insights(self, topic: str) -> Dict[str, Any]:
        """
        Recherche des tendances et insights sur un sujet
        
        Args:
            topic: Sujet à analyser
        
        Returns:
            Dict avec les tendances et insights
        """
        queries = [
            f"{topic} tendances 2024",
            f"{topic} nouveautés actualités",
            f"{topic} best practices bonnes pratiques"
        ]
        
        all_results = []
        
        for query in queries:
            results = self.search(
                query=query,
                count=8,
                freshness="pw",  # Dernière semaine
                result_filter="web,news"
            )
            
            if "error" not in results:
                all_results.append({
                    "query": query,
                    "results": results
                })
        
        return self._format_trends_insights(all_results, topic)
    
    def _format_video_research(self, search_results: Dict, video_prompt: str) -> Dict[str, Any]:
        """Formate les résultats de recherche pour la création de vidéo"""
        
        if "web" not in search_results:
            return {"error": "Aucun résultat web trouvé"}
        
        web_results = search_results.get("web", {}).get("results", [])
        
        # Extraire les informations clés
        key_points = []
        sources = []
        
        for result in web_results[:10]:
            # Informations de base
            source_info = {
                "title": result.get("title", ""),
                "url": result.get("url", ""),
                "description": result.get("description", ""),
                "published": result.get("age", "")
            }
            sources.append(source_info)
            
            # Extraire des points clés du titre et description
            title = result.get("title", "").lower()
            description = result.get("description", "").lower()
            
            # Mots-clés pertinents trouvés
            keywords = self._extract_keywords(title + " " + description)
            if keywords:
                key_points.extend(keywords)
        
        # Déduplication des points clés
        unique_points = list(set(key_points))
        
        return {
            "video_prompt": video_prompt,
            "research_summary": {
                "total_sources": len(sources),
                "key_points": unique_points[:15],  # Top 15 points
                "trending_topics": self._identify_trends(web_results),
                "content_suggestions": self._generate_content_suggestions(unique_points)
            },
            "sources": sources,
            "generated_at": datetime.now().isoformat()
        }
    
    def _format_trends_insights(self, all_results: List, topic: str) -> Dict[str, Any]:
        """Formate les résultats de tendances et insights"""
        
        insights = {
            "topic": topic,
            "trends": [],
            "insights": [],
            "recent_developments": [],
            "content_opportunities": []
        }
        
        for result_group in all_results:
            query = result_group["query"]
            results = result_group["results"]
            
            if "web" in results:
                web_results = results["web"].get("results", [])
                
                for result in web_results[:5]:
                    insight = {
                        "source": query,
                        "title": result.get("title", ""),
                        "description": result.get("description", ""),
                        "url": result.get("url", ""),
                        "relevance": self._calculate_relevance(result, topic)
                    }
                    
                    if "tendances" in query:
                        insights["trends"].append(insight)
                    elif "nouveautés" in query:
                        insights["recent_developments"].append(insight)
                    else:
                        insights["insights"].append(insight)
        
        # Génerer des opportunités de contenu
        insights["content_opportunities"] = self._generate_content_opportunities(insights, topic)
        
        return insights
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extrait des mots-clés pertinents du texte"""
        # Mots-clés techniques et éducatifs courants
        tech_keywords = [
            "automatisation", "intelligence artificielle", "ia", "ai", "n8n", 
            "workflow", "api", "python", "formation", "tutoriel", "guide",
            "best practices", "optimisation", "productivité", "efficacité",
            "stratégie", "méthode", "technique", "outil", "plateforme"
        ]
        
        found_keywords = []
        text_lower = text.lower()
        
        for keyword in tech_keywords:
            if keyword in text_lower:
                found_keywords.append(keyword)
        
        return found_keywords
    
    def _identify_trends(self, web_results: List) -> List[str]:
        """Identifie les tendances à partir des résultats"""
        trends = []
        
        for result in web_results:
            title = result.get("title", "").lower()
            
            # Chercher des indicateurs de tendance
            trend_indicators = ["2024", "nouveau", "nouvelle", "innovation", "révolution", "avenir"]
            
            for indicator in trend_indicators:
                if indicator in title:
                    trends.append(result.get("title", ""))
                    break
        
        return trends[:5]  # Top 5 tendances
    
    def _generate_content_suggestions(self, key_points: List[str]) -> List[str]:
        """Génère des suggestions de contenu basées sur les points clés"""
        suggestions = []
        
        if "automatisation" in key_points:
            suggestions.append("Créer un segment sur l'automatisation des tâches répétitives")
        
        if "ia" in key_points or "intelligence artificielle" in key_points:
            suggestions.append("Expliquer les applications pratiques de l'IA")
        
        if "n8n" in key_points:
            suggestions.append("Démonstration en direct avec N8N")
        
        if "formation" in key_points:
            suggestions.append("Mentionner les ressources de formation Orra Academy")
        
        # Suggestions génériques
        suggestions.extend([
            "Inclure des exemples concrets et pratiques",
            "Ajouter une démo en temps réel",
            "Prévoir un call-to-action vers orra-academy.com"
        ])
        
        return suggestions[:8]  # Limiter à 8 suggestions
    
    def _calculate_relevance(self, result: Dict, topic: str) -> float:
        """Calcule la pertinence d'un résultat par rapport au sujet"""
        title = result.get("title", "").lower()
        description = result.get("description", "").lower()
        topic_lower = topic.lower()
        
        relevance = 0.0
        
        # Pertinence basée sur la présence du sujet dans le titre
        if topic_lower in title:
            relevance += 0.5
        
        # Pertinence basée sur la présence du sujet dans la description
        if topic_lower in description:
            relevance += 0.3
        
        # Bonus pour les mots-clés éducatifs
        educational_keywords = ["tutoriel", "guide", "formation", "apprendre", "comment"]
        for keyword in educational_keywords:
            if keyword in title or keyword in description:
                relevance += 0.1
                break
        
        return min(relevance, 1.0)  # Max 1.0
    
    def _generate_content_opportunities(self, insights: Dict, topic: str) -> List[str]:
        """Génère des opportunités de contenu basées sur les insights"""
        opportunities = []
        
        # Analyser les tendances
        if insights["trends"]:
            opportunities.append(f"Créer une série sur les tendances {topic} en 2024")
        
        # Analyser les développements récents
        if insights["recent_developments"]:
            opportunities.append(f"Couvrir les dernières nouveautés en {topic}")
        
        # Opportunités génériques
        opportunities.extend([
            f"Série de tutoriels avancés sur {topic}",
            f"Comparatif des outils {topic} populaires",
            f"Cas d'usage réels de {topic} en entreprise",
            f"FAQ sur {topic} pour débutants"
        ])
        
        return opportunities[:6]

    def generate_personalized_video_script(self, topic: str, target_audience: str = "débutants") -> Dict[str, Any]:
        """
        Génère un script vidéo personnalisé basé sur les recherches Brave
        et le profil de Maxens/Ryan de l'Orra Academy
        
        Args:
            topic: Sujet de la vidéo (ex: "MAKE pour les débutants")
            target_audience: Public cible (débutants, intermédiaires, avancés)
        
        Returns:
            Dict contenant le script personnalisé et les sources
        """
        
        # 1. NOUVEAU : Envoyer d'abord le prompt vers N8N
        prompt_webhook_result = self.send_video_prompt_to_n8n(topic, target_audience)
        request_id = prompt_webhook_result.get("request_id", f"video_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        
        # 2. Rechercher du contenu spécifique sur le sujet
        search_results = self.search_for_video_content(f"{topic} tutoriel français 2024")
        
        # 3. Rechercher les tendances et insights
        trends_data = self.search_trends_and_insights(topic.split()[0])  # Premier mot du topic
        
        if "error" in search_results or "error" in trends_data:
            return {"error": "Impossible de récupérer les données de recherche"}
        
        # 4. Extraire les informations clés
        key_points = search_results.get("research_summary", {}).get("key_points", [])
        trends = trends_data.get("trends", [])
        recent_developments = trends_data.get("recent_developments", [])
        
        # 5. Générer le script personnalisé
        script = self._create_personalized_script(topic, target_audience, key_points, trends, recent_developments)
        
        # Préparer la réponse finale
        final_result = {
            "script": script,
            "research_data": {
                "key_points": key_points,
                "trends": trends[:3],  # Top 3 tendances
                "sources_count": search_results.get("research_summary", {}).get("total_sources", 0),
                "content_suggestions": search_results.get("research_summary", {}).get("content_suggestions", [])
            },
            "generated_at": datetime.now().isoformat(),
            "request_id": request_id,
            "prompt_webhook_status": prompt_webhook_result
        }
        
        # 6. Envoyer le résultat final vers N8N
        final_webhook_result = self.send_to_n8n(
            data=final_result,
            event_type="video_script_generated"
        )
        final_result["final_webhook_status"] = final_webhook_result
        
        return final_result
    
    def _create_personalized_script(self, topic: str, audience: str, key_points: List, trends: List, developments: List) -> str:
        """Crée un script personnalisé avec le style de Maxens/Ryan"""
        
        # Informations personnelles de Maxens
        presenter_info = {
            "name": "Maxens",
            "aka": "Ryan", 
            "role": "CTO de l'Orra Academy",
            "expertise": "IA, automatisations, N8N",
            "platform": "orra-academy.com"
        }
        
        # Introduction personnalisée
        intro = f"""# Script pour "{topic}"

## Introduction (0-30s)
Salut tout le monde ! C'est {presenter_info['name']}, {presenter_info['role']}. 
Bienvenue sur Orra Academy ! Aujourd'hui, on va explorer {topic.lower()}.
"""
        
        # Si on a des développements récents, les mentionner
        if developments:
            latest_trend = developments[0].get("title", "")
            if latest_trend:
                intro += f"\nEt croyez-moi, avec les dernières évolutions comme {latest_trend.lower()}, c'est le moment parfait pour s'y mettre !"
        
        # Corps principal basé sur les recherches
        main_content = "\n## Corps principal (30s-4min)\n"
        
        # Points spécifiques basés sur les recherches
        if key_points:
            main_content += f"### 1. Les fondamentaux de {topic.split()[0]}\n"
            main_content += f"- Pourquoi {topic.split()[0]} est devenu incontournable en 2024\n"
            
            # Intégrer les mots-clés trouvés
            automation_keywords = [kp for kp in key_points if any(word in kp for word in ["automatisation", "workflow", "api"])]
            if automation_keywords:
                main_content += f"- Les bases de l'automatisation : {', '.join(automation_keywords[:3])}\n"
        
        main_content += f"""
### 2. Mise en pratique concrète
- Démo en direct : créer votre premier workflow
- Les erreurs que j'ai faites (et que vous pouvez éviter)
- Astuce de pro : comment je l'utilise chez Orra Academy

### 3. Cas d'usage réels pour {audience}
"""
        
        # Cas d'usage spécifiques selon l'audience
        if audience == "débutants":
            main_content += "- Automatiser vos emails et notifications\n- Connecter vos outils du quotidien\n- Gagner 2h par jour (vraiment !)\n"
        elif audience == "intermédiaires":
            main_content += "- Workflows avancés avec conditions\n- Intégration d'APIs tierces\n- Optimisation des performances\n"
        
        # Tendances si disponibles
        if trends:
            main_content += "\n### 4. Les tendances 2024 à connaître\n"
            for i, trend in enumerate(trends[:2], 1):
                trend_title = trend.get("title", "")
                if trend_title:
                    main_content += f"- Tendance {i} : {trend_title}\n"
        
        main_content += "\n### 5. Mes recommandations personnelles\n- Les outils que j'utilise quotidiennement\n- Comment intégrer ça dans votre routine\n- Le piège à éviter absolument"
        
        # Call to action personnalisé
        cta = f"""
## Call to action (4-4:30min)
Si vous voulez aller plus loin, j'ai créé une formation complète sur l'IA et les automatisations.
Vous y retrouverez tout ce qu'on fait chez Orra Academy, avec des modules sur Python, N8N, et bien plus.
Le lien est en description : {presenter_info['platform']}

Et si cette vidéo vous a aidé, un petit like ça fait toujours plaisir ! 😊
"""
        
        # Conclusion personnalisée
        conclusion = f"""
## Conclusion (4:30-5min)
Voilà les amis ! J'espère que ce tour d'horizon vous aura donné envie de vous lancer.
N'hésitez pas à me poser vos questions en commentaires, j'y réponds régulièrement.

À bientôt pour un nouveau tuto sur Orra Academy !
{presenter_info['name']} 👋
"""
        
        return intro + main_content + cta + conclusion

    def send_video_prompt_to_n8n(self, topic: str, target_audience: str) -> Dict[str, Any]:
        """
        Envoie le prompt de génération vidéo vers N8N avant traitement
        
        Args:
            topic: Sujet de la vidéo
            target_audience: Public cible
        
        Returns:
            Dict avec le statut de l'envoi
        """
        if not self.n8n_enabled:
            logger.info("Webhook N8N désactivé pour l'envoi du prompt")
            return {"status": "disabled", "message": "Webhook N8N désactivé"}
        
        if not self.n8n_webhook_url:
            logger.error("URL webhook N8N manquante pour l'envoi du prompt")
            return {"status": "error", "message": "URL webhook N8N manquante"}
        
        # Préparer les données du prompt pour N8N
        prompt_payload = {
            "event_type": "video_prompt_received",
            "timestamp": datetime.now().isoformat(),
            "source": "brave_search_service",
            "data": {
                "topic": topic,
                "target_audience": target_audience,
                "request_id": f"video_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "status": "prompt_received",
                "next_action": "generate_script"
            },
            "metadata": {
                "generated_by": "Orra Academy - Video Script Generator",
                "version": "1.0",
                "user": "Maxens - CTO Orra Academy"
            }
        }
        
        try:
            logger.info(f"Envoi prompt vidéo vers N8N: {topic}")
            
            headers = {
                "Content-Type": "application/json",
                "User-Agent": "Orra-Academy-VideoPrompt/1.0"
            }
            
            response = requests.post(
                self.n8n_webhook_url,
                json=prompt_payload,
                headers=headers,
                timeout=30
            )
            
            response.raise_for_status()
            
            logger.info(f"Prompt vidéo envoyé avec succès vers N8N - Status: {response.status_code}")
            
            return {
                "status": "success",
                "status_code": response.status_code,
                "message": "Prompt vidéo envoyé vers N8N avec succès",
                "request_id": prompt_payload["data"]["request_id"],
                "webhook_response": response.text if response.text else None
            }
            
        except requests.exceptions.Timeout:
            logger.error("Timeout lors de l'envoi du prompt vers N8N")
            return {"status": "error", "message": "Timeout webhook N8N pour le prompt"}
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Erreur webhook N8N pour le prompt: {e}")
            return {"status": "error", "message": f"Erreur webhook prompt: {str(e)}"}
        
        except Exception as e:
            logger.error(f"Erreur inattendue webhook N8N pour le prompt: {e}")
            return {"status": "error", "message": f"Erreur inattendue prompt: {str(e)}"}


# Instance globale du service
brave_search_service = BraveSearchService() 