"""
Routes pour les agents IA, conversations et messages.
"""
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any, Optional
import logging
import uuid
import os
from datetime import datetime
from pydantic import BaseModel
from openai import OpenAI

from services.supabase_service import supabase_service
from services.llm_service import generate_response

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

# Liste des modèles disponibles
AVAILABLE_MODELS = [
    {"id": "gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "description": "Modèle rapide et économique"},
    {"id": "gpt-4", "name": "GPT-4", "description": "Modèle avancé avec raisonnement amélioré"},
    {"id": "gpt-4.1-2025-04-14", "name": "GPT-4.1 Turbo", "description": "Nouvelle version plus performante"},
    {"id": "o3-2025-04-16", "name": "o3-2025-04-16", "description": "Modèle personnalisé"}
]

# Modèles Pydantic pour la génération de tâches
class TaskGenerationRequest(BaseModel):
    user_id: str
    context: Optional[Dict[str, Any]] = None
    preferences: Optional[Dict[str, Any]] = None
    model: Optional[str] = "gpt-3.5-turbo"

class TaskRecommendationRequest(BaseModel):
    user_id: str
    completed_task_id: str
    context: Optional[Dict[str, Any]] = None
    model: Optional[str] = "gpt-3.5-turbo"

# Route pour récupérer les modèles disponibles
@router.get("/models", status_code=status.HTTP_200_OK)
async def get_available_models():
    """Récupère la liste des modèles LLM disponibles."""
    # Liste des modèles disponibles
    available_models = [
        {
            "id": "gpt-4.1-2025-04-14",
            "name": "GPT-4.1 Turbo",
            "description": "Le plus récent et puissant modèle"
        },
        {
            "id": "gpt-4",
            "name": "GPT-4",
            "description": "Modèle très performant pour des tâches complexes"
        },
        {
            "id": "gpt-3.5-turbo",
            "name": "GPT-3.5 Turbo",
            "description": "Modèle rapide et économique"
        }
    ]
    
    return available_models

# Routes pour les agents
@router.get("/agents", tags=["AI Agents"])
async def get_agents():
    """Récupère tous les agents IA disponibles"""
    agents = await supabase_service.get_all_agents()
    return {"agents": agents}

@router.get("/agents/{agent_id}", tags=["AI Agents"])
async def get_agent(agent_id: str):
    """Récupère un agent par son ID"""
    agent = await supabase_service.get_agent_by_id(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} non trouvé")
    return agent

@router.post("/agents", tags=["AI Agents"])
async def create_agent(agent: Dict[str, Any]):
    """Crée un nouvel agent IA"""
    # Vérifier les champs requis
    required_fields = ["id", "name", "description", "avatar", "prompt"]
    for field in required_fields:
        if field not in agent:
            raise HTTPException(status_code=400, detail=f"Le champ '{field}' est requis")
    
    new_agent = await supabase_service.create_agent(agent)
    if not new_agent:
        raise HTTPException(status_code=500, detail="Erreur lors de la création de l'agent")
    return new_agent

@router.put("/agents/{agent_id}", tags=["AI Agents"])
async def update_agent(agent_id: str, agent: Dict[str, Any]):
    """Met à jour un agent existant"""
    existing_agent = await supabase_service.get_agent_by_id(agent_id)
    if not existing_agent:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} non trouvé")
    
    updated_agent = await supabase_service.update_agent(agent_id, agent)
    if not updated_agent:
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour de l'agent")
    return updated_agent

@router.delete("/agents/{agent_id}", tags=["AI Agents"])
async def delete_agent(agent_id: str):
    """Supprime un agent"""
    existing_agent = await supabase_service.get_agent_by_id(agent_id)
    if not existing_agent:
        raise HTTPException(status_code=404, detail=f"Agent {agent_id} non trouvé")
    
    success = await supabase_service.delete_agent(agent_id)
    if not success:
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression de l'agent")
    return {"success": True, "message": f"Agent {agent_id} supprimé avec succès"}

# Routes pour les conversations
@router.post("/conversations", tags=["AI Agents"])
async def create_conversation(data: Dict[str, Any]):
    """Crée une nouvelle conversation"""
    if "user_id" not in data or "agent_id" not in data:
        raise HTTPException(status_code=400, detail="Les champs 'user_id' et 'agent_id' sont requis")
    
    # Vérifier que l'agent existe
    agent = await supabase_service.get_agent_by_id(data["agent_id"])
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent {data['agent_id']} non trouvé")
    
    conversation_data = {
        "id": str(uuid.uuid4()),
        "user_id": data["user_id"],
        "agent_id": data["agent_id"],
        "created_at": datetime.now().isoformat()
    }
    
    new_conversation = await supabase_service.create_conversation(conversation_data)
    if not new_conversation:
        raise HTTPException(status_code=500, detail="Erreur lors de la création de la conversation")
    return new_conversation

@router.get("/conversations/user/{user_id}", tags=["AI Agents"])
async def get_user_conversations(user_id: str):
    """Récupère toutes les conversations d'un utilisateur"""
    conversations = await supabase_service.get_conversations_by_user(user_id)
    return {"conversations": conversations}

@router.get("/conversations/{conversation_id}", tags=["AI Agents"])
async def get_conversation(conversation_id: str):
    """Récupère une conversation et ses messages"""
    conversation = await supabase_service.get_conversation_by_id(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} non trouvée")
    
    messages = await supabase_service.get_messages_by_conversation(conversation_id)
    return {
        "conversation": conversation,
        "messages": messages
    }

@router.delete("/conversations/{conversation_id}", tags=["AI Agents"])
async def delete_conversation(conversation_id: str):
    """Supprime une conversation et tous ses messages"""
    conversation = await supabase_service.get_conversation_by_id(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} non trouvée")
    
    success = await supabase_service.delete_conversation(conversation_id)
    if not success:
        raise HTTPException(status_code=500, detail="Erreur lors de la suppression de la conversation")
    return {"success": True, "message": f"Conversation {conversation_id} supprimée avec succès"}

# Routes pour les messages
@router.post("/messages", tags=["AI Agents"])
async def add_message(data: Dict[str, Any]):
    """Ajoute un nouveau message et génère une réponse"""
    if "conversation_id" not in data or "content" not in data:
        raise HTTPException(status_code=400, detail="Les champs 'conversation_id' et 'content' sont requis")
    
    # Récupérer le modèle à utiliser (optionnel)
    model = data.get("model", os.environ.get("MODEL_OPENAI", "gpt-3.5-turbo"))
    
    # Vérifier que le modèle est valide
    valid_models = [m["id"] for m in AVAILABLE_MODELS]
    if model not in valid_models:
        logger.warning(f"Modèle {model} non valide, utilisation du modèle par défaut")
        model = os.environ.get("MODEL_OPENAI", "gpt-3.5-turbo")
    
    # Vérifier que la conversation existe
    conversation = await supabase_service.get_conversation_by_id(data["conversation_id"])
    if not conversation:
        raise HTTPException(status_code=404, detail=f"Conversation {data['conversation_id']} non trouvée")
    
    # Récupérer l'agent associé à la conversation
    agent = await supabase_service.get_agent_by_id(conversation["agent_id"])
    if not agent:
        raise HTTPException(status_code=404, detail=f"Agent {conversation['agent_id']} non trouvé")
    
    # Créer le message utilisateur
    user_message = {
        "id": str(uuid.uuid4()),
        "conversation_id": data["conversation_id"],
        "role": "user",
        "content": data["content"],
        "created_at": datetime.now().isoformat()
    }
    
    # Enregistrer le message utilisateur
    saved_user_message = await supabase_service.add_message(user_message)
    if not saved_user_message:
        raise HTTPException(status_code=500, detail="Erreur lors de l'enregistrement du message utilisateur")
    
    # Récupérer l'historique de la conversation pour le contexte
    conversation_history = await supabase_service.get_messages_by_conversation(data["conversation_id"])
    
    try:
        # Générer une réponse avec le modèle d'IA en utilisant le prompt de l'agent
        logger.info(f"Génération de réponse avec le modèle: {model}")
        agent_response = generate_response(
            user_message=data["content"],
            conversation_history=conversation_history,
            agent_prompt=agent["prompt"],
            model=model
        )
        
        # Créer le message de réponse de l'agent
        assistant_message = {
            "id": str(uuid.uuid4()),
            "conversation_id": data["conversation_id"],
            "role": "assistant",
            "content": agent_response,
            "created_at": datetime.now().isoformat()
        }
        
        # Enregistrer la réponse de l'agent
        saved_assistant_message = await supabase_service.add_message(assistant_message)
        if not saved_assistant_message:
            raise HTTPException(status_code=500, detail="Erreur lors de l'enregistrement de la réponse de l'agent")
        
        return {
            "user_message": saved_user_message,
            "assistant_message": saved_assistant_message,
            "model_used": model
        }
    
    except Exception as e:
        logger.error(f"Erreur lors de la génération de la réponse: {str(e)}")
        # En cas d'erreur, générer une réponse de secours simple
        try:
            fallback_content = f"Désolé, je n'ai pas pu traiter votre demande en raison d'une erreur technique. Erreur: {str(e)}"
            
            # Créer un message de réponse de secours
            fallback_message = {
                "id": str(uuid.uuid4()),
                "conversation_id": data["conversation_id"],
                "role": "assistant",
                "content": fallback_content,
                "created_at": datetime.now().isoformat()
            }
            
            # Enregistrer la réponse de secours
            saved_fallback = await supabase_service.add_message(fallback_message)
            
            return {
                "user_message": saved_user_message,
                "assistant_message": saved_fallback or fallback_message
            }
        except Exception as inner_e:
            logger.error(f"Erreur lors de la génération de la réponse de secours: {str(inner_e)}")
            raise HTTPException(status_code=500, detail="Erreur critique lors du traitement de la demande")

@router.get("/messages/conversation/{conversation_id}", tags=["AI Agents"])
async def get_conversation_messages(conversation_id: str):
    """Récupère tous les messages d'une conversation"""
    conversation = await supabase_service.get_conversation_by_id(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail=f"Conversation {conversation_id} non trouvée")
    
    messages = await supabase_service.get_messages_by_conversation(conversation_id)
    return {"messages": messages}

# Nouvelle route pour la génération de tâches IA
@router.post("/generate-tasks", tags=["AI Agents"])
async def generate_smart_tasks(request: TaskGenerationRequest):
    """Génère des tâches SMART basées sur le contexte et les préférences de l'utilisateur"""
    try:
        # Récupérer l'historique des tâches de l'utilisateur
        user_tasks = await supabase_service.get_user_tasks(request.user_id)
        user_habits = await supabase_service.get_user_habits(request.user_id)
        
        # Préparer le contexte pour l'IA
        context = {
            "user_tasks": user_tasks,
            "user_habits": user_habits,
            "preferences": request.preferences or {},
            "context": request.context or {}
        }
        
        # Utiliser OpenAI pour générer des tâches SMART
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        
        response = client.chat.completions.create(
            model=request.model,
            messages=[
                {"role": "system", "content": """Tu es un assistant de productivité qui génère des tâches SMART.
                Génère 3-5 tâches SMART (Spécifiques, Mesurables, Atteignables, Réalistes, Temporellement définies)
                basées sur le contexte et les préférences de l'utilisateur.
                
                Réponds au format JSON avec:
                {
                    "tasks": [
                        {
                            "title": "Titre de la tâche",
                            "description": "Description détaillée",
                            "category": "catégorie",
                            "estimated_time": "durée estimée",
                            "deadline": "date limite",
                            "priority": "priorité (high/medium/low)",
                            "smart_criteria": {
                                "specific": "critère spécifique",
                                "measurable": "critère mesurable",
                                "achievable": "critère atteignable",
                                "relevant": "critère réaliste",
                                "time_bound": "critère temporel"
                            }
                        }
                    ]
                }"""},
                {"role": "user", "content": f"Contexte: {context}"}
            ],
            temperature=0.7
        )
        
        # Extraire et valider la réponse
        tasks = response.choices[0].message.content
        # Sauvegarder les tâches générées
        saved_tasks = await supabase_service.save_generated_tasks(request.user_id, tasks)
        
        return {"tasks": saved_tasks}
        
    except Exception as e:
        logger.error(f"Erreur lors de la génération des tâches: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération des tâches: {str(e)}")

# Nouvelle route pour les recommandations de tâches
@router.post("/recommend-next-task", tags=["AI Agents"])
async def recommend_next_task(request: TaskRecommendationRequest):
    """Recommande la prochaine tâche à faire après avoir complété une tâche"""
    try:
        # Récupérer la tâche complétée
        completed_task = await supabase_service.get_task_by_id(request.completed_task_id)
        if not completed_task:
            raise HTTPException(status_code=404, detail="Tâche non trouvée")
            
        # Récupérer les tâches en attente de l'utilisateur
        pending_tasks = await supabase_service.get_user_pending_tasks(request.user_id)
        
        # Utiliser OpenAI pour recommander la prochaine tâche
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        
        response = client.chat.completions.create(
            model=request.model,
            messages=[
                {"role": "system", "content": """Tu es un assistant de productivité qui recommande la prochaine tâche à faire.
                Analyse la tâche complétée et les tâches en attente pour recommander la meilleure tâche suivante.
                
                Réponds au format JSON avec:
                {
                    "recommended_task": {
                        "task_id": "ID de la tâche recommandée",
                        "reason": "Explication de pourquoi cette tâche est recommandée maintenant"
                    },
                    "alternative_tasks": [
                        {
                            "task_id": "ID de la tâche alternative",
                            "reason": "Explication de pourquoi cette tâche pourrait être une alternative"
                        }
                    ]
                }"""},
                {"role": "user", "content": f"Tâche complétée: {completed_task}\nTâches en attente: {pending_tasks}\nContexte: {request.context}"}
            ],
            temperature=0.7
        )
        
        recommendation = response.choices[0].message.content
        return {"recommendation": recommendation}
        
    except Exception as e:
        logger.error(f"Erreur lors de la recommandation de tâche: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la recommandation: {str(e)}") 