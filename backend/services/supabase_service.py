"""
Service pour gérer les interactions avec Supabase.
Cette implémentation utilise le pattern Singleton pour assurer une seule instance du client.
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Chargement des variables d'environnement
load_dotenv()

# Initialisation du client Supabase
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    logger.warning("Les variables d'environnement SUPABASE_URL et SUPABASE_KEY ne sont pas définies")
    supabase = None
else:
    supabase = create_client(supabase_url, supabase_key)


class SupabaseService:
    """Service pour interagir avec la base de données Supabase"""
    
    _instance = None
    
    def __new__(cls):
        """Implémentation du pattern Singleton pour éviter de créer plusieurs clients"""
        if cls._instance is None:
            cls._instance = super(SupabaseService, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialise la connexion à Supabase"""
        try:
            url = os.environ.get("SUPABASE_URL", "").strip()
            key = os.environ.get("SUPABASE_KEY", "").strip()
            service_key = os.environ.get("SUPABASE_SERVICE_KEY", "").strip()
            
            if not url or not key:
                raise ValueError("Les variables d'environnement SUPABASE_URL et SUPABASE_KEY sont requises")
            
            self.supabase: Client = create_client(url, key)
            # Client avec privilèges administratifs
            self.supabase_admin: Client = create_client(url, service_key) if service_key else None
            logger.info("Connexion à Supabase établie avec succès")
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation de Supabase: {str(e)}")
            raise
    
    # Méthodes pour les tâches
    
    async def get_tasks_by_theme(self, theme: str):
        """Récupère toutes les tâches pour un thème donné"""
        try:
            response = self.supabase.table('tasks').select('*').eq('theme', theme).execute()
            return response.data
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des tâches pour le thème '{theme}': {str(e)}")
            return []
    
    async def create_task(self, task_data):
        """Crée une nouvelle tâche dans Supabase"""
        try:
            response = self.supabase.table('tasks').insert(task_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erreur lors de la création d'une tâche: {str(e)}")
            return None
    
    async def update_task(self, task_id, update_data):
        """Met à jour une tâche existante"""
        try:
            response = self.supabase.table('tasks').update(update_data).eq('id', task_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour de la tâche {task_id}: {str(e)}")
            return None
    
    async def delete_task(self, task_id):
        """Supprime une tâche"""
        try:
            self.supabase.table('tasks').delete().eq('id', task_id).execute()
            return True
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de la tâche {task_id}: {str(e)}")
            return False
    
    # Méthodes pour les thèmes
    
    async def get_all_themes(self):
        """Récupère tous les thèmes distincts"""
        try:
            response = self.supabase.table('tasks').select('theme').execute()
            themes = set([item.get('theme') for item in response.data if item.get('theme')])
            return list(themes)
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des thèmes: {str(e)}")
            return []
    
    # Méthodes pour les catégories
    
    async def get_user_categories(self, user_id: str):
        """Récupère les catégories d'un utilisateur spécifique"""
        try:
            response = self.supabase.table('categories').select('*').eq('user_id', user_id).execute()
            return response.data
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des catégories: {str(e)}")
            return []
    
    async def create_category(self, category_data):
        """Crée une nouvelle catégorie"""
        try:
            response = self.supabase.table('categories').insert(category_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erreur lors de la création d'une catégorie: {str(e)}")
            return None
    
    async def delete_category(self, category_id):
        """Supprime une catégorie"""
        try:
            self.supabase.table('categories').delete().eq('id', category_id).execute()
            return True
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de la catégorie {category_id}: {str(e)}")
            return False
    
    # Méthodes pour les agents IA
    
    async def get_all_agents(self):
        """
        Récupère tous les agents depuis Supabase
        """
        try:
            response = self.supabase.table('agents').select('*').execute()
            return response.data
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des agents: {str(e)}")
            return None
    
    async def get_agent_by_id(self, agent_id):
        """
        Récupère un agent par son ID
        """
        try:
            response = self.supabase.table('agents').select('*').eq('id', agent_id).execute()
            if response.data and len(response.data) > 0:
                return response.data[0]
            return None
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de l'agent: {str(e)}")
            return None
    
    async def create_agent(self, agent_data):
        """
        Crée un nouvel agent dans Supabase
        """
        try:
            response = self.supabase.table('agents').insert(agent_data).execute()
            return response.data
        except Exception as e:
            logger.error(f"Erreur lors de la création de l'agent: {str(e)}")
            return None
    
    async def update_agent(self, agent_id, update_data):
        """Met à jour un agent existant"""
        try:
            response = self.supabase.table('agents').update(update_data).eq('id', agent_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour de l'agent {agent_id}: {str(e)}")
            return None
    
    async def delete_agent(self, agent_id):
        """Supprime un agent"""
        try:
            self.supabase.table('agents').delete().eq('id', agent_id).execute()
            return True
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de l'agent {agent_id}: {str(e)}")
            return False
    
    # Méthodes pour les conversations
    
    async def create_conversation(self, conversation_data):
        """Crée une nouvelle conversation"""
        try:
            response = self.supabase.table('conversations').insert(conversation_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erreur lors de la création d'une conversation: {str(e)}")
            return None
    
    async def get_conversations_by_user(self, user_id):
        """Récupère toutes les conversations d'un utilisateur"""
        try:
            response = self.supabase.table('conversations').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
            return response.data
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des conversations: {str(e)}")
            return []
    
    async def get_conversation_by_id(self, conversation_id):
        """Récupère une conversation par son ID"""
        try:
            response = self.supabase.table('conversations').select('*').eq('id', conversation_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de la conversation {conversation_id}: {str(e)}")
            return None
    
    async def delete_conversation(self, conversation_id):
        """Supprime une conversation et tous ses messages"""
        try:
            # Supabase gèrera la suppression en cascade si définie dans la base de données
            self.supabase.table('conversations').delete().eq('id', conversation_id).execute()
            return True
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de la conversation {conversation_id}: {str(e)}")
            return False
    
    # Méthodes pour les messages
    
    async def add_message(self, message_data):
        """Ajoute un nouveau message à une conversation"""
        try:
            response = self.supabase.table('messages').insert(message_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erreur lors de l'ajout d'un message: {str(e)}")
            return None
    
    async def get_messages_by_conversation(self, conversation_id):
        """Récupère tous les messages d'une conversation"""
        try:
            response = self.supabase.table('messages').select('*').eq('conversation_id', conversation_id).order('created_at', asc=True).execute()
            return response.data
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des messages: {str(e)}")
            return []
    
    # Méthodes utilitaires
    
    async def check_table_exists(self, table_name):
        """Vérifie si une table existe dans Supabase"""
        try:
            # Utiliser une commande PostgreSQL pour vérifier l'existence de la table
            query = f"SELECT to_regclass('public.{table_name}')"
            response = self.supabase.rpc('execute_sql', {'query': query}).execute()
            
            # Si la réponse contient une valeur non nulle, la table existe
            return response.data and response.data[0] and response.data[0]['to_regclass'] is not None
            
        except Exception as e:
            logger.error(f"Erreur lors de la vérification de l'existence de la table {table_name}: {str(e)}")
            return False

    async def initialize_schema(self):
        """Initialise le schéma de la base de données (tables, extensions, etc.)"""
        try:
            # Liste des tables à vérifier
            tables = [
                'agents', 'conversations', 'messages', 'tasks', 'categories',
                'documents', 'conversation_histories', 'weekly_strategies'
            ]
            
            # Vérifier si les tables existent déjà
            missing_tables = []
            for table in tables:
                if not await self.check_table_exists(table):
                    missing_tables.append(table)
            
            # Si toutes les tables existent, ne rien faire
            if not missing_tables:
                logger.info("Toutes les tables existent déjà")
                return True
                
            # Sinon, créer les tables manquantes
            logger.info(f"Tables manquantes à créer: {missing_tables}")
            
            # Créer l'extension vector si elle n'existe pas déjà
            if 'documents' in missing_tables:
                try:
                    self.supabase_admin.rpc('execute_sql', {'query': 'CREATE EXTENSION IF NOT EXISTS vector;'}).execute()
                    logger.info("Extension vector créée ou déjà existante")
                except Exception as e:
                    logger.error(f"Erreur lors de la création de l'extension vector: {str(e)}")
                    # Continuer malgré l'erreur, car les autres tables peuvent toujours être créées
            
            # Créer les tables manquantes
            for table in missing_tables:
                if table == 'documents':
                    self.supabase_admin.rpc('execute_sql', {'query': '''
                        CREATE TABLE IF NOT EXISTS documents (
                            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                            content TEXT NOT NULL,
                            metadata JSONB,
                            embedding VECTOR(1536),
                            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                        );
                        
                        CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents 
                        USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
                    '''}).execute()
                    logger.info("Table documents créée avec succès")
                
                elif table == 'conversation_histories':
                    self.supabase_admin.rpc('execute_sql', {'query': '''
                        CREATE TABLE IF NOT EXISTS conversation_histories (
                            id TEXT PRIMARY KEY,
                            agent_id TEXT NOT NULL,
                            user_id TEXT NOT NULL,
                            messages JSONB NOT NULL,
                            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                        );
                        
                        CREATE INDEX IF NOT EXISTS conversation_histories_agent_user_idx 
                        ON conversation_histories(agent_id, user_id);
                    '''}).execute()
                    logger.info("Table conversation_histories créée avec succès")
                
                elif table == 'weekly_strategies':
                    self.supabase_admin.rpc('execute_sql', {'query': '''
                        CREATE TABLE IF NOT EXISTS weekly_strategies (
                            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                            user_id TEXT NOT NULL,
                            content TEXT NOT NULL,
                            week_number INTEGER NOT NULL,
                            year INTEGER NOT NULL,
                            platform TEXT DEFAULT 'linkedin',
                            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                        );
                        
                        CREATE INDEX IF NOT EXISTS weekly_strategies_user_week_idx 
                        ON weekly_strategies(user_id, year, week_number);
                    '''}).execute()
                    logger.info("Table weekly_strategies créée avec succès")
            
            return True
            
        except Exception as e:
            logger.error(f"Erreur lors de l'initialisation du schéma: {str(e)}")
            return False

    # Méthodes pour les documents et embeddings
    
    async def store_document(self, document_data):
        """
        Stocke un document avec son embedding dans Supabase
        
        Args:
            document_data: Dictionnaire contenant le contenu, les métadonnées et l'embedding
            
        Returns:
            Le document stocké ou None en cas d'erreur
        """
        try:
            response = self.supabase.table('documents').insert({
                'content': document_data['content'],
                'metadata': document_data['metadata'],
                'embedding': document_data['embedding']
            }).execute()
            
            logger.info(f"Document stocké avec succès")
            return response.data[0] if response.data else None
            
        except Exception as e:
            logger.error(f"Erreur lors du stockage du document: {str(e)}")
            return None
    
    async def store_documents_batch(self, documents_data):
        """
        Stocke plusieurs documents en une seule requête
        
        Args:
            documents_data: Liste de dictionnaires document_data
            
        Returns:
            Liste des documents stockés ou liste vide en cas d'erreur
        """
        try:
            # Préparer les données pour l'insertion
            documents_to_insert = []
            for doc in documents_data:
                documents_to_insert.append({
                    'content': doc['content'],
                    'metadata': doc['metadata'],
                    'embedding': doc['embedding']
                })
            
            # Insérer tous les documents en une seule requête
            response = self.supabase.table('documents').insert(documents_to_insert).execute()
            
            logger.info(f"{len(documents_to_insert)} documents stockés avec succès")
            return response.data if response.data else []
            
        except Exception as e:
            logger.error(f"Erreur lors du stockage par lots des documents: {str(e)}")
            return []
    
    async def search_documents(self, query_embedding, filters=None, limit=5):
        """
        Recherche des documents similaires à un embedding de requête
        
        Args:
            query_embedding: Vecteur d'embedding pour la recherche
            filters: Dictionnaire de filtres à appliquer sur les métadonnées
            limit: Nombre maximum de résultats à retourner
            
        Returns:
            Liste des documents similaires
        """
        try:
            # Construire la requête de base
            match_query = self.supabase.rpc(
                'match_documents',
                {
                    'query_embedding': query_embedding,
                    'match_threshold': 0.5,
                    'match_count': limit
                }
            )
            
            # Appliquer les filtres si fournis
            if filters and isinstance(filters, dict):
                for key, value in filters.items():
                    if isinstance(value, list):
                        # Pour les listes, utiliser l'opérateur @> (contains)
                        match_query = match_query.filter(f"metadata->>'{key}'", "in", value)
                    else:
                        # Pour les valeurs simples
                        match_query = match_query.filter(f"metadata->>'{key}'", "eq", value)
            
            # Exécuter la requête
            response = match_query.execute()
            
            logger.info(f"Recherche de documents similaires réussie: {len(response.data)} résultats")
            return response.data
            
        except Exception as e:
            logger.error(f"Erreur lors de la recherche de documents similaires: {str(e)}")
            return []
    
    async def search_documents_by_text(self, query_text, filters=None, limit=5):
        """
        Recherche des documents similaires à une requête textuelle
        
        Args:
            query_text: Texte de la requête
            filters: Dictionnaire de filtres à appliquer sur les métadonnées
            limit: Nombre maximum de résultats à retourner
            
        Returns:
            Liste des documents similaires
        """
        try:
            from .embedding_service import embedding_service
            
            # Générer l'embedding pour la requête
            query_embedding = embedding_service.get_embedding(query_text)
            
            # Utiliser la méthode de recherche par embedding
            return await self.search_documents(query_embedding, filters, limit)
            
        except Exception as e:
            logger.error(f"Erreur lors de la recherche de documents par texte: {str(e)}")
            return []
    
    # Méthodes pour l'historique des conversations
    
    async def store_conversation_history(self, agent_id, user_id, messages):
        """
        Stocke ou met à jour l'historique d'une conversation
        
        Args:
            agent_id: ID de l'agent
            user_id: ID de l'utilisateur
            messages: Liste des messages (dictionnaires avec role et content)
            
        Returns:
            Les données stockées ou None en cas d'erreur
        """
        try:
            # Créer une clé unique pour la conversation
            conversation_id = f"{agent_id}_{user_id}"
            
            # Vérifier si la conversation existe déjà
            response = self.supabase.table('conversation_histories').select('*').eq('id', conversation_id).execute()
            
            if response.data and len(response.data) > 0:
                # Mettre à jour la conversation existante
                response = self.supabase.table('conversation_histories').update({
                    'messages': messages,
                    'updated_at': datetime.now().isoformat()
                }).eq('id', conversation_id).execute()
                
                logger.info(f"Historique de conversation mis à jour: {conversation_id}")
            else:
                # Créer une nouvelle entrée
                response = self.supabase.table('conversation_histories').insert({
                    'id': conversation_id,
                    'agent_id': agent_id,
                    'user_id': user_id,
                    'messages': messages
                }).execute()
                
                logger.info(f"Nouvel historique de conversation créé: {conversation_id}")
            
            return response.data[0] if response.data else None
            
        except Exception as e:
            logger.error(f"Erreur lors du stockage de l'historique de conversation: {str(e)}")
            return None
    
    async def get_conversation_history(self, agent_id, user_id):
        """
        Récupère l'historique d'une conversation
        
        Args:
            agent_id: ID de l'agent
            user_id: ID de l'utilisateur
            
        Returns:
            Les messages de la conversation ou None si non trouvée
        """
        try:
            # Créer la clé unique
            conversation_id = f"{agent_id}_{user_id}"
            
            # Récupérer la conversation
            response = self.supabase.table('conversation_histories').select('*').eq('id', conversation_id).execute()
            
            if response.data and len(response.data) > 0:
                logger.info(f"Historique de conversation récupéré: {conversation_id}")
                return response.data[0]['messages']
            else:
                logger.info(f"Aucun historique trouvé pour la conversation: {conversation_id}")
                return []
                
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de l'historique: {str(e)}")
            return []
    
    # Méthodes pour les stratégies hebdomadaires
    
    async def store_weekly_strategy(self, strategy_data):
        """
        Stocke une stratégie de contenu hebdomadaire
        
        Args:
            strategy_data: Dictionnaire contenant user_id, content, week_number, year, et platform
            
        Returns:
            La stratégie stockée ou None en cas d'erreur
        """
        try:
            # S'assurer que les champs obligatoires sont présents
            required_fields = ['user_id', 'content', 'week_number', 'year']
            for field in required_fields:
                if field not in strategy_data:
                    raise ValueError(f"Champ obligatoire manquant: {field}")
            
            # Valeurs par défaut
            if 'platform' not in strategy_data:
                strategy_data['platform'] = 'linkedin'
            
            # Insérer la stratégie
            response = self.supabase.table('weekly_strategies').insert(strategy_data).execute()
            
            logger.info(f"Stratégie hebdomadaire stockée avec succès pour la semaine {strategy_data['week_number']}")
            return response.data[0] if response.data else None
            
        except Exception as e:
            logger.error(f"Erreur lors du stockage de la stratégie hebdomadaire: {str(e)}")
            return None
    
    async def get_weekly_strategy(self, user_id, week_number=None, year=None, platform='linkedin'):
        """
        Récupère une stratégie hebdomadaire
        
        Args:
            user_id: ID de l'utilisateur
            week_number: Numéro de la semaine (par défaut: semaine courante)
            year: Année (par défaut: année courante)
            platform: Plateforme (par défaut: linkedin)
            
        Returns:
            La stratégie ou None si non trouvée
        """
        try:
            # Valeurs par défaut pour la semaine et l'année courantes
            if week_number is None or year is None:
                current_date = datetime.now()
                if week_number is None:
                    week_number = current_date.isocalendar()[1]
                if year is None:
                    year = current_date.year
            
            # Construire la requête
            query = self.supabase.table('weekly_strategies').select('*')\
                .eq('user_id', user_id)\
                .eq('week_number', week_number)\
                .eq('year', year)\
                .eq('platform', platform)
            
            # Exécuter la requête
            response = query.execute()
            
            if response.data and len(response.data) > 0:
                logger.info(f"Stratégie hebdomadaire récupérée pour la semaine {week_number}")
                return response.data[0]
            else:
                logger.info(f"Aucune stratégie trouvée pour la semaine {week_number}")
                return None
                
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de la stratégie hebdomadaire: {str(e)}")
            return None

    # Méthodes pour les tâches sans thème

    async def get_all_tasks(self):
        """Récupère toutes les tâches sans filtrer par thème"""
        try:
            response = self.supabase.table('tasks').select('*').order('created_at', desc=True).execute()
            return response.data
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de toutes les tâches: {str(e)}")
            return []

    async def get_task_by_id(self, task_id):
        """Récupère une tâche par son ID"""
        try:
            response = self.supabase.table('tasks').select('*').eq('id', task_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de la tâche {task_id}: {str(e)}")
            return None

    async def update_task_by_id(self, task_id, update_data):
        """Met à jour une tâche existante par son ID"""
        try:
            response = self.supabase.table('tasks').update(update_data).eq('id', task_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour de la tâche {task_id}: {str(e)}")
            return None

    async def delete_task_by_id(self, task_id):
        """Supprime une tâche par son ID"""
        try:
            self.supabase.table('tasks').delete().eq('id', task_id).execute()
            return True
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de la tâche {task_id}: {str(e)}")
            return False

    async def get_user_habits(self, user_id: str) -> List[Dict[str, Any]]:
        """Récupère toutes les habitudes d'un utilisateur"""
        try:
            if not supabase:
                raise Exception("Supabase n'est pas configuré")
            
            response = supabase.table('habits').select('*').eq('user_id', user_id).execute()
            return response.data
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des habitudes: {str(e)}")
            raise
    
    async def get_habit_by_id(self, habit_id: int) -> Optional[Dict[str, Any]]:
        """Récupère une habitude par son ID"""
        try:
            if not supabase:
                raise Exception("Supabase n'est pas configuré")
            
            response = supabase.table('habits').select('*').eq('id', habit_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erreur lors de la récupération de l'habitude {habit_id}: {str(e)}")
            raise
    
    async def add_habit(self, habit_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ajoute une nouvelle habitude"""
        try:
            if not supabase:
                raise Exception("Supabase n'est pas configuré")
            
            response = supabase.table('habits').insert(habit_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erreur lors de l'ajout de l'habitude: {str(e)}")
            raise
    
    async def update_habit(self, habit_id: int, habit_data: Dict[str, Any]) -> Dict[str, Any]:
        """Met à jour une habitude existante"""
        try:
            if not supabase:
                raise Exception("Supabase n'est pas configuré")
            
            response = supabase.table('habits').update(habit_data).eq('id', habit_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour de l'habitude {habit_id}: {str(e)}")
            raise
    
    async def delete_habit(self, habit_id: int) -> bool:
        """Supprime une habitude"""
        try:
            if not supabase:
                raise Exception("Supabase n'est pas configuré")
            
            # Supprimer d'abord les complétions associées
            await self.delete_habit_completions(habit_id)
            
            # Puis supprimer l'habitude
            response = supabase.table('habits').delete().eq('id', habit_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Erreur lors de la suppression de l'habitude {habit_id}: {str(e)}")
            raise
    
    async def get_habit_completions(self, habit_id: int) -> List[Dict[str, Any]]:
        """Récupère toutes les complétions d'une habitude"""
        try:
            if not supabase:
                raise Exception("Supabase n'est pas configuré")
            
            response = supabase.table('habit_completions').select('*').eq('habit_id', habit_id).execute()
            return response.data
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des complétions pour l'habitude {habit_id}: {str(e)}")
            raise
    
    async def add_habit_completion(self, completion_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ajoute une nouvelle complétion d'habitude"""
        try:
            if not supabase:
                raise Exception("Supabase n'est pas configuré")
            
            response = supabase.table('habit_completions').insert(completion_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Erreur lors de l'ajout de la complétion: {str(e)}")
            raise
    
    async def delete_habit_completions(self, habit_id: int) -> bool:
        """Supprime toutes les complétions d'une habitude"""
        try:
            if not supabase:
                raise Exception("Supabase n'est pas configuré")
            
            response = supabase.table('habit_completions').delete().eq('habit_id', habit_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Erreur lors de la suppression des complétions pour l'habitude {habit_id}: {str(e)}")
            raise


# Créer une instance unique du service
supabase_service = SupabaseService() 