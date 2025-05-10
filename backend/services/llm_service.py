"""
Service pour la génération de réponses via des modèles de langage (LLM).
Ce service est utilisé pour générer des réponses aux messages des utilisateurs
en fonction du prompt spécifique de l'agent IA.
"""
import os
import logging
from typing import List, Dict, Any
import openai
import traceback
import random
from dotenv import load_dotenv

# Chargement des variables d'environnement
load_dotenv()

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration d'OpenAI avec le nouveau client
api_key = os.environ.get("OPENAI_API_KEY")
model_name = os.environ.get("MODEL_OPENAI", "gpt-3.5-turbo")
client = openai.OpenAI(api_key=api_key)
DEFAULT_MODEL = model_name

logger.info(f"Configuration du LLM avec le modèle: {DEFAULT_MODEL}")
logger.info(f"Clé API (premiers caractères): {api_key[:8]}..." if api_key else "ERREUR: Clé API manquante")


def generate_response(
    user_message: str, 
    conversation_history: List[Dict[str, Any]], 
    agent_prompt: str,
    model: str = DEFAULT_MODEL
) -> str:
    """
    Génère une réponse à un message utilisateur en utilisant un modèle LLM.
    
    Args:
        user_message: Le message de l'utilisateur
        conversation_history: L'historique de la conversation
        agent_prompt: Le prompt spécifique à l'agent IA
        model: Le modèle LLM à utiliser
        
    Returns:
        La réponse générée par le modèle
    """
    try:
        # Vérifier si la clé API est configurée
        if not api_key:
            logger.error("ERREUR CRITIQUE: Clé API OpenAI non configurée")
            return "ERREUR: L'API OpenAI n'est pas correctement configurée. Veuillez vérifier votre clé API dans le fichier .env."
        
        logger.info(f"Génération de réponse avec le modèle {model}")
        logger.info(f"Prompt système: {agent_prompt[:50]}...")
        logger.info(f"Message utilisateur: {user_message[:50]}...")
        
        # Utilisation d'OpenAI pour la génération de réponses
        # Préparer les messages pour l'API
        messages = [
            {"role": "system", "content": agent_prompt}
        ]
        
        # Ajouter l'historique de la conversation (limité aux 10 derniers messages)
        for message in conversation_history[-10:]:
            messages.append({
                "role": message["role"],
                "content": message["content"]
            })
        
        # Ajouter le message utilisateur actuel
        messages.append({"role": "user", "content": user_message})
        
        logger.info(f"Appel API OpenAI avec {len(messages)} messages")
        
        # Appeler l'API OpenAI avec la nouvelle interface
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=500,
            temperature=0.7,
        )
        
        # Extraire la réponse avec la nouvelle structure
        generated_response = response.choices[0].message.content.strip()
        logger.info(f"Réponse générée: {generated_response[:50]}...")
        return generated_response
    
    except Exception as e:
        error_traceback = traceback.format_exc()
        logger.error(f"Erreur lors de la génération de réponse: {str(e)}")
        logger.error(f"Détails de l'erreur: {error_traceback}")
        return f"Désolé, une erreur est survenue lors de la génération de la réponse: {str(e)}"


def generate_fallback_response(user_message: str, agent_prompt: str) -> str:
    """
    Génère une réponse de secours en cas d'erreur avec l'API OpenAI.
    Cette fonction simule une réponse basique pour éviter une interruption du service.
    
    Args:
        user_message: Le message de l'utilisateur
        agent_prompt: Le prompt spécifique à l'agent IA
        
    Returns:
        Une réponse générée localement
    """
    # Extraire les mots-clés du message utilisateur
    keywords = extract_keywords(user_message.lower())
    
    # Réponses génériques basées sur le type d'agent
    if "business" in agent_prompt.lower() or "startup" in agent_prompt.lower():
        responses = [
            f"D'après mon analyse, votre question sur {' et '.join(keywords[:2] if len(keywords) > 1 else keywords)} est pertinente pour votre entreprise. Je vous recommande de vous concentrer sur la validation de marché avant d'investir trop de ressources.",
            "Les startups qui réussissent commencent toujours par identifier un problème douloureux pour un segment spécifique. Itérez rapidement et obtenez des retours clients dès le début.",
            "Pensez à définir une métrique clé de croissance et optimisez exclusivement pour celle-ci. La clarté de la vision est essentielle."
        ]
    elif "jobs" in agent_prompt.lower() or "steve" in agent_prompt.lower():
        responses = [
            f"Concernant votre question sur {' et '.join(keywords[:2] if len(keywords) > 1 else keywords)}, je vous conseille de simplifier radicalement. Éliminez tout ce qui n'est pas essentiel.",
            "La vision compte plus que les fonctionnalités. Concentrez-vous sur l'expérience utilisateur et l'attention aux détails qui font la différence.",
            "N'essayez pas de plaire à tout le monde. Créez un produit extraordinaire qui résout parfaitement un problème pour un groupe spécifique d'utilisateurs."
        ]
    elif "webinaire" in agent_prompt.lower():
        responses = [
            f"Pour optimiser votre webinaire sur {' et '.join(keywords[:2] if len(keywords) > 1 else keywords)}, je vous recommande de structurer votre présentation avec un hook puissant et une offre irrésistible.",
            "Utilisez des témoignages vidéo et prévoyez une séance de Q&R structurée pour maximiser l'engagement et les conversions.",
            "Créez une séquence email pré et post-webinaire pour maximiser les inscriptions et les conversions. N'oubliez pas d'ajouter de l'urgence."
        ]
    else:
        responses = [
            f"Merci pour votre question sur {' et '.join(keywords[:2] if len(keywords) > 1 else keywords)}. Je vous recommande d'adopter une approche méthodique et data-driven.",
            "La clé du succès est d'itérer rapidement et d'obtenir des retours utilisateurs dès que possible.",
            "Concentrez-vous sur la création de valeur pour vos utilisateurs et le reste suivra naturellement."
        ]
    
    # Retourner une réponse aléatoire
    return random.choice(responses)


def extract_keywords(text: str) -> List[str]:
    """
    Extrait des mots-clés pertinents d'un texte.
    
    Args:
        text: Le texte à analyser
        
    Returns:
        Une liste de mots-clés extraits
    """
    # Liste basique de mots vides en français
    stopwords = {
        'le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'de', 'du', 'au', 'aux',
        'ce', 'cette', 'ces', 'mon', 'ton', 'son', 'ma', 'ta', 'sa', 'mes', 'tes', 
        'ses', 'notre', 'votre', 'leur', 'nos', 'vos', 'leurs', 'je', 'tu', 'il', 
        'elle', 'nous', 'vous', 'ils', 'elles', 'qui', 'que', 'quoi', 'dont', 'où',
        'comment', 'pourquoi', 'quand', 'est', 'sont', 'sera', 'seront', 'a', 'ont',
        'pour', 'par', 'avec', 'sans', 'en', 'dans', 'sur', 'sous', 'entre', 'vers',
        'chez', 'mais', 'donc', 'car', 'si', 'ni', 'ne', 'pas', 'plus', 'moins'
    }
    
    # Diviser le texte en mots
    words = text.split()
    
    # Filtrer les mots vides et les mots courts
    keywords = [word for word in words if word not in stopwords and len(word) > 3]
    
    # Retourner les 5 premiers mots-clés uniques (ou moins s'il n'y en a pas 5)
    return list(dict.fromkeys(keywords))[:5] 