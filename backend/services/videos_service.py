"""
Service pour la gestion des vidéos dans Supabase
"""

import os
import json
import logging
from datetime import datetime, date
from typing import List, Dict, Any, Optional
from supabase import create_client, Client
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

logger = logging.getLogger(__name__)

class VideosService:
    def __init__(self):
        """Initialise le service vidéos avec Supabase"""
        try:
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            
            if not supabase_url or not supabase_key:
                logger.warning("Variables d'environnement Supabase manquantes, utilisation du mode offline")
                self.supabase = None
                self.offline_mode = True
                self._videos_cache = []
            else:
                self.supabase: Client = create_client(supabase_url, supabase_key)
                self.offline_mode = False
                logger.info("Service vidéos connecté à Supabase")
                
        except Exception as e:
            logger.error(f"Erreur connexion Supabase: {e}")
            self.supabase = None
            self.offline_mode = True
            self._videos_cache = []

    async def get_all_videos(self, status_filter: Optional[str] = None) -> List[Dict[str, Any]]:
        """Récupère toutes les vidéos, optionnellement filtrées par statut"""
        try:
            if self.offline_mode:
                videos = self._get_offline_videos()
                if status_filter:
                    videos = [v for v in videos if v.get('status') == status_filter]
                return videos
            
            query = self.supabase.table("videos").select("*").order("created_at", desc=True)
            
            if status_filter:
                query = query.eq("status", status_filter)
            
            response = query.execute()
            videos = response.data
            
            # Convertir les dates pour le frontend
            for video in videos:
                if video.get('deadline'):
                    video['deadline'] = str(video['deadline'])
                if video.get('created_at'):
                    video['created_at'] = video['created_at']
                if video.get('updated_at'):
                    video['updated_at'] = video['updated_at']
            
            logger.info(f"Récupéré {len(videos)} vidéos depuis Supabase")
            return videos
            
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des vidéos: {e}")
            return self._get_offline_videos()

    async def create_video(self, video_data: Dict[str, Any]) -> Dict[str, Any]:
        """Crée une nouvelle vidéo"""
        try:
            if self.offline_mode:
                return self._create_offline_video(video_data)
            
            # Préparer les données pour Supabase
            insert_data = {
                "title": video_data.get("title"),
                "prompt": video_data.get("prompt"),
                "script": video_data.get("script"),
                "status": video_data.get("status", "a_tourner"),
                "priority": video_data.get("priority", "medium"),
                "category": video_data.get("category", "Orra Academy"),
                "deadline": video_data.get("deadline"),
                "estimated_duration": video_data.get("estimated_duration"),
                "enriched_with_search": video_data.get("enriched_with_search", False),
                "research_data": json.dumps(video_data.get("research_data")) if video_data.get("research_data") else None
            }
            
            # Nettoyer les valeurs None et vides
            insert_data = {k: v for k, v in insert_data.items() if v is not None and v != ""}
            
            response = self.supabase.table("videos").insert(insert_data).execute()
            
            if response.data:
                video = response.data[0]
                logger.info(f"Vidéo créée avec succès: {video['id']}")
                return video
            else:
                raise Exception("Aucune donnée retournée après insertion")
                
        except Exception as e:
            logger.error(f"Erreur lors de la création de la vidéo: {e}")
            # Fallback en mode offline
            return self._create_offline_video(video_data)

    async def update_video(self, video_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Met à jour une vidéo existante"""
        try:
            if self.offline_mode:
                return self._update_offline_video(video_id, updates)
            
            # Préparer les données de mise à jour
            update_data = {}
            
            for key, value in updates.items():
                if key in ['title', 'prompt', 'script', 'status', 'priority', 'category', 
                          'deadline', 'estimated_duration', 'enriched_with_search']:
                    if value is not None and value != "":
                        update_data[key] = value
                elif key == 'research_data' and value:
                    update_data['research_data'] = json.dumps(value) if isinstance(value, dict) else value
                    update_data['enriched_with_search'] = True
                    update_data['last_search_update'] = datetime.now().isoformat()
            
            if not update_data:
                raise ValueError("Aucune donnée valide à mettre à jour")
            
            response = self.supabase.table("videos").update(update_data).eq("id", video_id).execute()
            
            if response.data:
                video = response.data[0]
                logger.info(f"Vidéo mise à jour avec succès: {video_id}")
                return video
            else:
                raise Exception("Aucune donnée retournée après mise à jour")
                
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour de la vidéo {video_id}: {e}")
            return self._update_offline_video(video_id, updates)

    async def delete_video(self, video_id: str) -> bool:
        """Supprime une vidéo"""
        try:
            if self.offline_mode:
                return self._delete_offline_video(video_id)
            
            response = self.supabase.table("videos").delete().eq("id", video_id).execute()
            
            if response.data:
                logger.info(f"Vidéo supprimée avec succès: {video_id}")
                return True
            else:
                return False
                
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de la vidéo {video_id}: {e}")
            return False

    async def get_video_by_id(self, video_id: str) -> Optional[Dict[str, Any]]:
        """Récupère une vidéo par son ID"""
        try:
            if self.offline_mode:
                return self._get_offline_video_by_id(video_id)
            
            response = self.supabase.table("videos").select("*").eq("id", video_id).execute()
            
            if response.data and len(response.data) > 0:
                video = response.data[0]
                # Convertir les dates
                if video.get('deadline'):
                    video['deadline'] = str(video['deadline'])
                return video
            else:
                return None
                
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de la vidéo {video_id}: {e}")
            return None

    async def get_videos_stats(self) -> Dict[str, int]:
        """Récupère les statistiques des vidéos"""
        try:
            if self.offline_mode:
                return self._get_offline_stats()
            
            response = self.supabase.rpc("get_videos_stats").execute()
            
            if response.data and len(response.data) > 0:
                stats = response.data[0]
                logger.info("Statistiques vidéos récupérées depuis Supabase")
                return stats
            else:
                return self._get_offline_stats()
                
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des statistiques: {e}")
            return self._get_offline_stats()

    async def search_videos(self, query: str) -> List[Dict[str, Any]]:
        """Recherche des vidéos par texte"""
        try:
            if self.offline_mode:
                return self._search_offline_videos(query)
            
            # Recherche full-text en PostgreSQL
            response = self.supabase.table("videos").select("*").text_search(
                "search_vector", 
                query, 
                config="french"
            ).execute()
            
            return response.data or []
            
        except Exception as e:
            logger.error(f"Erreur lors de la recherche de vidéos: {e}")
            return self._search_offline_videos(query)

    # Méthodes pour le mode offline/fallback
    def _get_offline_videos(self) -> List[Dict[str, Any]]:
        """Retourne des vidéos d'exemple en mode offline"""
        return [
            {
                "id": "offline-1",
                "title": "Introduction à N8N",
                "prompt": "Créer un tutoriel N8N pour débutants",
                "script": "# Script N8N...",
                "status": "a_tourner",
                "priority": "high",
                "category": "N8N Tutorial",
                "deadline": "2024-06-10",
                "enriched_with_search": False,
                "created_at": "2024-06-01T10:00:00Z"
            },
            {
                "id": "offline-2", 
                "title": "Agents IA avec LangChain",
                "prompt": "Démonstration d'agents IA",
                "script": "# Script LangChain...",
                "status": "a_monter",
                "priority": "medium",
                "category": "IA Agents",
                "deadline": "2024-06-15",
                "enriched_with_search": True,
                "created_at": "2024-06-02T10:00:00Z"
            }
        ]

    def _create_offline_video(self, video_data: Dict[str, Any]) -> Dict[str, Any]:
        """Simule la création d'une vidéo en mode offline"""
        video = {
            "id": f"offline-{len(self._videos_cache) + 1}",
            "title": video_data.get("title", "Nouvelle vidéo"),
            "status": video_data.get("status", "a_tourner"),
            "created_at": datetime.now().isoformat(),
            **video_data
        }
        self._videos_cache.append(video)
        return video

    def _update_offline_video(self, video_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Simule la mise à jour d'une vidéo en mode offline"""
        for video in self._videos_cache:
            if video["id"] == video_id:
                video.update(updates)
                video["updated_at"] = datetime.now().isoformat()
                return video
        return {}

    def _delete_offline_video(self, video_id: str) -> bool:
        """Simule la suppression d'une vidéo en mode offline"""
        self._videos_cache = [v for v in self._videos_cache if v["id"] != video_id]
        return True

    def _get_offline_video_by_id(self, video_id: str) -> Optional[Dict[str, Any]]:
        """Récupère une vidéo par ID en mode offline"""
        for video in self._videos_cache:
            if video["id"] == video_id:
                return video
        return None

    def _get_offline_stats(self) -> Dict[str, int]:
        """Calcule les statistiques en mode offline"""
        videos = self._get_offline_videos() + self._videos_cache
        return {
            "total_videos": len(videos),
            "videos_a_tourner": len([v for v in videos if v.get("status") == "a_tourner"]),
            "videos_a_monter": len([v for v in videos if v.get("status") == "a_monter"]),
            "videos_a_publier": len([v for v in videos if v.get("status") == "a_publier"]),
            "videos_publiees": len([v for v in videos if v.get("status") == "publie"]),
            "videos_enriched": len([v for v in videos if v.get("enriched_with_search")])
        }

    def _search_offline_videos(self, query: str) -> List[Dict[str, Any]]:
        """Recherche en mode offline"""
        query_lower = query.lower()
        videos = self._get_offline_videos() + self._videos_cache
        
        return [
            video for video in videos
            if query_lower in video.get("title", "").lower() or
               query_lower in video.get("prompt", "").lower() or
               query_lower in video.get("script", "").lower()
        ]

# Instance globale du service
videos_service = VideosService() 