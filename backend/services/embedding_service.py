"""
Service pour gérer les embeddings de documents à l'aide d'OpenAI.
"""
import os
import re
import logging
import traceback
import textwrap
import tiktoken
from typing import List, Dict, Any
from dotenv import load_dotenv
import openai

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Chargement des variables d'environnement
load_dotenv()

class EmbeddingService:
    """Service pour générer et gérer les embeddings de documents"""
    
    def __init__(self, api_key=None, model="text-embedding-ada-002"):
        """
        Initialise le service d'embedding
        
        Args:
            api_key: Clé API OpenAI (si None, utilise OPENAI_API_KEY depuis .env)
            model: Modèle d'embedding à utiliser
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            logger.error("Aucune clé API OpenAI trouvée. Définissez OPENAI_API_KEY dans votre fichier .env")
        
        self.model = model
        self.client = openai.OpenAI(api_key=self.api_key)
        
        # Paramètres de chunking
        self.chunk_size = 1000
        self.chunk_overlap = 200
        self.max_tokens = 8191  # Limite pour text-embedding-ada-002
        
        # Initialiser l'encodeur pour compter les tokens
        try:
            self.tokenizer = tiktoken.encoding_for_model(self.model)
        except Exception:
            self.tokenizer = tiktoken.get_encoding("cl100k_base")  # Fallback
        
        logger.info(f"Service d'embedding initialisé avec le modèle {self.model}")
    
    def get_embedding(self, text: str) -> List[float]:
        """
        Génère un embedding vectoriel pour le texte donné
        
        Args:
            text: Texte à encoder
            
        Returns:
            Liste de flottants représentant l'embedding
        """
        if not self.api_key:
            raise ValueError("Clé API OpenAI manquante")
        
        # Nettoyer et tronquer le texte si nécessaire
        text = self._clean_text(text)
        
        # Vérifier la longueur en tokens et tronquer si nécessaire
        tokens = self.tokenizer.encode(text)
        if len(tokens) > self.max_tokens:
            logger.warning(f"Le texte dépasse la limite de {self.max_tokens} tokens. Troncature appliquée.")
            text = self.tokenizer.decode(tokens[:self.max_tokens])
        
        try:
            response = self.client.embeddings.create(
                model=self.model,
                input=text
            )
            embedding = response.data[0].embedding
            logger.debug(f"Embedding généré avec succès ({len(embedding)} dimensions)")
            return embedding
        except Exception as e:
            logger.error(f"Erreur lors de la génération de l'embedding: {str(e)}")
            logger.error(traceback.format_exc())
            raise
    
    def _clean_text(self, text: str) -> str:
        """
        Nettoie le texte avant de générer l'embedding
        
        Args:
            text: Texte à nettoyer
            
        Returns:
            Texte nettoyé
        """
        if not text:
            return ""
        
        # Remplacer les sauts de ligne multiples par un seul
        text = re.sub(r'\n+', '\n', text)
        
        # Remplacer les espaces multiples par un seul
        text = re.sub(r'\s+', ' ', text)
        
        # Supprimer les caractères non imprimables
        text = ''.join(c for c in text if c.isprintable() or c in ['\n', '\t'])
        
        return text.strip()
    
    def chunk_document(self, document: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Découpe un document en chunks pour l'embedding
        
        Args:
            document: Contenu du document
            metadata: Métadonnées du document
            
        Returns:
            Liste de dictionnaires contenant le contenu et les métadonnées de chaque chunk
        """
        if not document:
            return []
        
        # S'assurer que metadata est un dictionnaire
        if metadata is None:
            metadata = {}
        else:
            # Copier pour éviter de modifier l'original
            metadata = metadata.copy()
        
        # Nettoyer le document
        document = self._clean_text(document)
        
        # Découper en paragraphes
        paragraphs = document.split('\n\n')
        
        chunks = []
        current_chunk = []
        current_size = 0
        
        for i, para in enumerate(paragraphs):
            # Estimer la taille en tokens
            para_size = len(self.tokenizer.encode(para))
            
            # Si le paragraphe est trop grand, le subdiviser
            if para_size > self.chunk_size:
                para_chunks = textwrap.wrap(para, width=self.chunk_size)
                for para_chunk in para_chunks:
                    chunks.append({
                        "content": para_chunk,
                        "metadata": {
                            **metadata,
                            "chunk_index": len(chunks),
                            "is_partial": True
                        }
                    })
                continue
            
            # Si ajouter ce paragraphe dépasse la taille du chunk
            if current_size + para_size > self.chunk_size:
                # Sauvegarder le chunk actuel
                if current_chunk:
                    chunks.append({
                        "content": "\n\n".join(current_chunk),
                        "metadata": {
                            **metadata,
                            "chunk_index": len(chunks),
                            "is_partial": False
                        }
                    })
                
                # Commencer un nouveau chunk
                current_chunk = [para]
                current_size = para_size
            else:
                # Ajouter au chunk actuel
                current_chunk.append(para)
                current_size += para_size
        
        # Ajouter le dernier chunk s'il n'est pas vide
        if current_chunk:
            chunks.append({
                "content": "\n\n".join(current_chunk),
                "metadata": {
                    **metadata,
                    "chunk_index": len(chunks),
                    "is_partial": False
                }
            })
        
        logger.info(f"Document découpé en {len(chunks)} chunks")
        return chunks
    
    def process_document(self, document: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Traite un document complet: découpage et génération d'embeddings
        
        Args:
            document: Contenu du document
            metadata: Métadonnées du document
            
        Returns:
            Liste de dictionnaires contenant le contenu, les métadonnées et l'embedding de chaque chunk
        """
        chunks = self.chunk_document(document, metadata)
        
        processed_chunks = []
        for chunk in chunks:
            try:
                # Générer l'embedding pour ce chunk
                embedding = self.get_embedding(chunk["content"])
                
                # Ajouter l'embedding au chunk
                processed_chunk = {
                    "content": chunk["content"],
                    "metadata": chunk["metadata"],
                    "embedding": embedding
                }
                
                processed_chunks.append(processed_chunk)
                
            except Exception as e:
                logger.error(f"Erreur lors du traitement du chunk {chunk['metadata'].get('chunk_index')}: {str(e)}")
                logger.error(traceback.format_exc())
                # Continuer avec les autres chunks
        
        logger.info(f"Document traité avec succès: {len(processed_chunks)} chunks avec embeddings")
        return processed_chunks

# Instance singleton du service
embedding_service = EmbeddingService() 