"""
Routes pour la gestion des tâches
"""
from fastapi import APIRouter, HTTPException, Body, Query, Path
from typing import Dict, Any, List, Optional
import json
import os
import logging
import re
from openai import OpenAI
from services.supabase_service import supabase_service
from pydantic import BaseModel

# Configuration du logging
logger = logging.getLogger(__name__)

# Création du router
router = APIRouter(tags=["tasks"])

# Modèles Pydantic pour la validation des données
class TaskBase(BaseModel):
    title: str
    deadline: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = "medium"
    completed: Optional[bool] = False

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    deadline: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None

class Task(TaskBase):
    id: int
    
    class Config:
        orm_mode = True

# Catégories de tâches
CATEGORIES = [
    "personnel", "professionnel", "santé", "finance", 
    "éducation", "loisirs", "famille", "autre",
    "Vidéo", "Organisation", "Productivité", "Travailler",
    "Suivi personnel", "Automatisation", "Marketing", "Technique"
]

# API pour récupérer les catégories
@router.get("/categories", response_model=Dict[str, list])
async def get_categories():
    return {"categories": CATEGORIES}

# API pour récupérer toutes les tâches
@router.get("/tasks", response_model=Dict[str, List[Task]])
async def get_all_tasks():
    try:
        tasks = await supabase_service.get_all_tasks()
        return {"tasks": tasks}
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des tâches: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

# API pour créer une nouvelle tâche
@router.post("/tasks", response_model=Dict[str, Task])
async def create_task(task: TaskCreate):
    try:
        # Convertir le modèle Pydantic en dictionnaire
        task_data = task.dict()
        
        # Créer la tâche dans la base de données
        created_task = await supabase_service.create_task(task_data)
        
        if not created_task:
            raise HTTPException(status_code=500, detail="Erreur lors de la création de la tâche")
        
        return {"task": created_task}
    except Exception as e:
        logger.error(f"Erreur lors de la création de la tâche: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

# API pour récupérer une tâche par son ID
@router.get("/tasks/{task_id}", response_model=Dict[str, Task])
async def get_task(task_id: int = Path(..., title="ID de la tâche")):
    try:
        task = await supabase_service.get_task_by_id(task_id)
        
        if not task:
            raise HTTPException(status_code=404, detail=f"Tâche avec ID {task_id} non trouvée")
        
        return {"task": task}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de la tâche {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

# API pour mettre à jour une tâche
@router.put("/tasks/{task_id}", response_model=Dict[str, Task])
async def update_task_by_id(
    updates: TaskUpdate,
    task_id: int = Path(..., title="ID de la tâche")
):
    try:
        # Convertir le modèle Pydantic en dictionnaire, en excluant les None
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="Aucune donnée fournie pour la mise à jour")
        
        # Mettre à jour la tâche
        updated_task = await supabase_service.update_task_by_id(task_id, update_data)
        
        if not updated_task:
            raise HTTPException(status_code=404, detail=f"Tâche avec ID {task_id} non trouvée")
        
        return {"task": updated_task}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour de la tâche {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

# API pour supprimer une tâche
@router.delete("/tasks/{task_id}", response_model=Dict[str, bool])
async def delete_task_by_id(task_id: int = Path(..., title="ID de la tâche")):
    try:
        success = await supabase_service.delete_task_by_id(task_id)
        
        if not success:
            raise HTTPException(status_code=404, detail=f"Tâche avec ID {task_id} non trouvée")
        
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression de la tâche {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

# API pour générer des tâches simples (fallback)
@router.post("/generate_tasks")
async def generate_simple_tasks(data: Dict[str, Any] = Body(...)):
    theme = data.get("theme", "")
    
    if not theme:
        raise HTTPException(status_code=400, detail="Aucun thème fourni")
    
    # Générer des tâches basiques
    tasks = []
    for i in range(5):
        tasks.append({
            "id": i + 1,
            "text": f"Tâche {i+1} pour {theme}",
            "completed": False
        })
    
    return {"theme": theme, "tasks": tasks}

# API pour générer des tâches avec OpenAI
@router.post("/generate")
async def generate_tasks(data: Dict[str, Any] = Body(...)):
    try:
        if not data:
            raise HTTPException(status_code=400, detail="Données invalides")
            
        theme = data.get("theme", "").strip()
        if not theme:
            raise HTTPException(status_code=400, detail="Veuillez spécifier un thème")
        
        is_smart_objective = data.get("is_smart_objective", False)
            
        # Vérifier si le thème existe déjà
        existing_tasks = await supabase_service.get_tasks_by_theme(theme)
        if existing_tasks and not is_smart_objective:
            return {"theme": theme, "tasks": existing_tasks}
        
        # Utiliser OpenAI pour générer des tâches
        client = OpenAI(
            api_key=os.environ.get("OPENAI_API_KEY"),
        )
        
        if is_smart_objective:
            # Générer un objectif SMART et des tâches associées
            response = client.chat.completions.create(
                model=os.environ.get("MODEL_OPENAI"),
                messages=[
                    {"role": "system", "content": f"""Tu es un assistant spécialisé dans la transformation d'objectifs vagues en objectifs SMART.
                    
                    Pour l'objectif : "{theme}"
                    
                    1. Transforme-le en objectif SMART:
                       - Spécifique: précis et concret
                       - Mesurable: avec des critères quantifiables
                       - Atteignable: réaliste avec les moyens disponibles
                       - Réaliste: adapté au contexte
                       - Temporel: avec une échéance
                    
                    2. Propose 5 tâches concrètes pour atteindre cet objectif.
                    
                    Réponds avec un objet JSON contenant:
                    {
                        "smart_objective": {
                            "title": "Titre reformulé de l'objectif",
                            "specific": "Explication de l'aspect spécifique",
                            "measurable": "Explication de l'aspect mesurable",
                            "achievable": "Explication de l'aspect atteignable",
                            "realistic": "Explication de l'aspect réaliste",
                            "time_bound": "Échéance précise"
                        },
                        "tasks": [
                            {
                                "id": 1,
                                "text": "Description de la tâche 1",
                                "hashtags": ["catégorie1", "catégorie2"],
                                "eisenhower": "important_urgent" | "important_not_urgent" | "not_important_urgent" | "not_important_not_urgent",
                                "estimated_time": "45min",
                                "deadline": "YYYY-MM-DD"
                            },
                            // ... autres tâches
                        ]
                    }
                    """}
                ],
                temperature=0.7,
            )
        else:
            # Générer une liste de tâches normales
            response = client.chat.completions.create(
                model=os.environ.get("MODEL_OPENAI"),
                messages=[
                    {"role": "system", "content": f"""Tu es un assistant qui génère une tâche unique et détaillée. 
                    Crée une seule tâche pour le thème: {theme}.
                    
                    Pour cette tâche:
                    - Donne une description claire et précise
                    - Ajoute un ou deux hashtags pertinents (par exemple #productivité, #sport, #santé, #finance)
                    - Détermine sa priorité selon la matrice d'Eisenhower (important_urgent, important_not_urgent, not_important_urgent, not_important_not_urgent)
                    - Estime le temps nécessaire (15min, 30min, 1h, etc.)
                    - Propose une deadline logique (YYYY-MM-DD)
                    
                    Retourne un objet JSON avec ces clés:
                    - id (1)
                    - text (description de la tâche)
                    - hashtags (liste de hashtags pertinents sans le symbole #)
                    - eisenhower (important_urgent, important_not_urgent, not_important_urgent, not_important_not_urgent)
                    - estimated_time (chaîne de caractères comme "30min" ou "2h")
                    - deadline (format YYYY-MM-DD)
                    - completed (toujours false)
                    """}
                ],
                temperature=0.7,
            )
        
        response_text = response.choices[0].message.content.strip()
        
        # Extraire le JSON des réponses
        if is_smart_objective:
            # Pour les objectifs SMART, on cherche le JSON entier
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(0)
            
            try:
                data = json.loads(response_text)
                smart_objective = data.get("smart_objective", {})
                tasks = data.get("tasks", [])
                
                # Générer des IDs uniques pour chaque tâche
                for i, task in enumerate(tasks):
                    task["id"] = i + 1
                    task["completed"] = False
                
                # Sauvegarder l'objectif SMART et ses tâches
                await supabase_service.save_smart_objective(theme, smart_objective, tasks)
                
                return {
                    "theme": theme,
                    "smart_objective": smart_objective,
                    "tasks": tasks
                }
            except json.JSONDecodeError as e:
                logger.error(f"Erreur lors du parsing JSON: {str(e)}")
                raise HTTPException(status_code=500, detail="Erreur lors de la génération de l'objectif SMART")
        else:
            # Pour les tâches normales
            try:
                # Nettoyer la réponse pour s'assurer qu'il n'y a que du JSON
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    response_text = json_match.group(0)
                
                task_data = json.loads(response_text)
                task_data["completed"] = False
                
                # Sauvegarder la tâche
                await supabase_service.create_task(task_data)
                
                return {"theme": theme, "tasks": [task_data]}
            except json.JSONDecodeError as e:
                logger.error(f"Erreur lors du parsing JSON: {str(e)}")
                raise HTTPException(status_code=500, detail="Erreur lors de la génération de la tâche")
                
    except Exception as e:
        logger.error(f"Erreur lors de la génération des tâches: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

# API pour récupérer les tâches par thème
@router.get("/tasks/{theme}")
async def get_tasks(theme: str):
    try:
        tasks = await supabase_service.get_tasks_by_theme(theme)
        return {"theme": theme, "tasks": tasks}
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des tâches pour {theme}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

# API pour mettre à jour une tâche
@router.put("/tasks/{theme}/{task_id}")
async def update_task(theme: str, task_id: int, updates: Dict[str, Any] = Body(...)):
    try:
        updated_task = await supabase_service.update_task(theme, task_id, updates)
        if not updated_task:
            raise HTTPException(status_code=404, detail=f"Tâche {task_id} non trouvée")
        return {"task": updated_task}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour de la tâche {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

# API pour supprimer une tâche
@router.delete("/tasks/{theme}/{task_id}")
async def delete_task(theme: str, task_id: int):
    try:
        success = await supabase_service.delete_task(theme, task_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Tâche {task_id} non trouvée")
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la suppression de la tâche {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur interne: {str(e)}")

# API pour obtenir des recommandations
@router.get("/recommendations")
async def get_recommendations(
    available_time: str = Query("30min", description="Temps disponible (e.g., 15min, 1h)"),
    energy_level: str = Query("medium", description="Niveau d'énergie (low, medium, high)")
):
    try:
        # Utiliser OpenAI pour générer des recommandations
        client = OpenAI(
            api_key=os.environ.get("OPENAI_API_KEY"),
        )
        
        # Récupérer toutes les tâches
        all_themes = await supabase_service.get_all_themes()
        all_tasks = []
        
        for theme in all_themes:
            tasks = await supabase_service.get_tasks_by_theme(theme)
            # Ne récupérer que les tâches non complétées
            incomplete_tasks = [t for t in tasks if not t.get("completed", False)]
            all_tasks.extend(incomplete_tasks)
        
        if not all_tasks:
            return {"message": "Aucune tâche disponible pour des recommandations", "recommendations": []}
        
        # Limiter le nombre de tâches pour l'API
        if len(all_tasks) > 20:
            all_tasks = all_tasks[:20]
            
        # Envoyer les tâches à OpenAI pour obtenir des recommandations
        response = client.chat.completions.create(
            model=os.environ.get("MODEL_OPENAI", "gpt-3.5-turbo"),
            messages=[
                {"role": "system", "content": f"""Tu es un assistant intelligent qui aide à prioriser les tâches.
                
                L'utilisateur a {available_time} de disponible et son niveau d'énergie est {energy_level}.
                
                Voici ses tâches en attente:
                {json.dumps(all_tasks, ensure_ascii=False, indent=2)}
                
                Recommande 1 à 3 tâches qui seraient les plus appropriées à faire maintenant, en tenant compte:
                - Du temps disponible
                - Du niveau d'énergie actuel
                - De la priorité Eisenhower de chaque tâche
                - Des deadlines
                
                Réponds en français et au format JSON avec:
                {{
                    "message": "Un message personnalisé expliquant pourquoi ces tâches sont recommandées",
                    "recommendations": [
                        {{
                            "task_id": "ID de la tâche recommandée",
                            "text": "Description de la tâche",
                            "reason": "Explication courte de pourquoi cette tâche est recommandée maintenant"
                        }},
                        ...
                    ]
                }}
                """}
            ],
            temperature=0.7,
        )
        
        response_text = response.choices[0].message.content.strip()
        
        # Extraire le JSON
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            response_text = json_match.group(0)
            
        try:
            recommendations = json.loads(response_text)
            return recommendations
        except json.JSONDecodeError as e:
            logger.error(f"Erreur lors du parsing JSON des recommandations: {str(e)}")
            return {
                "message": "Voici quelques tâches que vous pourriez faire maintenant",
                "recommendations": [
                    {
                        "task_id": task["id"],
                        "text": task["text"],
                        "reason": "Cette tâche correspond à votre disponibilité actuelle"
                    }
                    for task in all_tasks[:3]
                ]
            }
            
    except Exception as e:
        logger.error(f"Erreur lors de la génération des recommandations: {str(e)}")
        return {
            "message": "Une erreur s'est produite lors de la génération des recommandations",
            "recommendations": []
        }

# API pour obtenir une revue hebdomadaire
@router.get("/weekly-review")
async def get_weekly_review():
    try:
        # Calculer les statistiques
        stats = await supabase_service.get_task_statistics()
        
        if not stats:
            return {
                "message": "Pas assez de données pour générer une revue hebdomadaire.",
                "statistics": {
                    "total_tasks": 0,
                    "completed_tasks": 0,
                    "pending_tasks": 0,
                    "completion_rate": 0,
                    "categories": {}
                },
                "smart_objectives": []
            }
        
        # Récupérer les objectifs SMART
        smart_objectives = await supabase_service.get_smart_objectives()
        
        # Utiliser OpenAI pour générer un résumé
        client = OpenAI(
            api_key=os.environ.get("OPENAI_API_KEY"),
        )
        
        response = client.chat.completions.create(
            model=os.environ.get("MODEL_OPENAI", "gpt-4o-mini"),
            messages=[
                {"role": "system", "content": f"""Tu es un coach en productivité qui analyse les données de tâches d'un utilisateur.
                
                Voici les statistiques de l'utilisateur pour cette semaine:
                {json.dumps(stats, ensure_ascii=False, indent=2)}
                
                Génère une analyse personnalisée en français avec:
                - Une évaluation des performances de la semaine
                - Identification des points forts
                - Suggestion d'amélioration pour la semaine prochaine
                - Un ton encourageant et motivant
                
                Réponds en texte simple, sans formatage JSON.
                """}
            ],
            temperature=0.7,
        )
        
        message = response.choices[0].message.content.strip()
        
        return {
            "message": message,
            "statistics": stats,
            "smart_objectives": smart_objectives
        }
            
    except Exception as e:
        logger.error(f"Erreur lors de la génération de la revue hebdomadaire: {str(e)}")
        return {
            "message": "Une erreur s'est produite lors de la génération de la revue hebdomadaire.",
            "statistics": {
                "total_tasks": 0,
                "completed_tasks": 0,
                "pending_tasks": 0,
                "completion_rate": 0,
                "categories": {}
            },
            "smart_objectives": []
        }
