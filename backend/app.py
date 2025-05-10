import os
import json
import re
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import random
import logging
import pathlib
from services.habits_service import habits_service

# Configuration du logging
logging.basicConfig(level=logging.DEBUG)

# Chargement des variables d'environnement depuis le fichier .env
load_dotenv()

app = Flask(__name__)

# Configuration détaillée de CORS
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]}})

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Catégories de tâches
CATEGORIES = [
    "personnel", "professionnel", "santé", "finance", 
    "éducation", "loisirs", "famille", "autre"
]

# Chargement des tâches depuis le fichier JSON
def load_tasks():
    try:
        with open("tasks.json", "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

# Sauvegarde des tâches dans le fichier JSON
def save_tasks(tasks):
    with open("tasks.json", "w") as f:
        json.dump(tasks, f, indent=2)

# Chemin vers le build React
react_build_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend/build')

# Configurer Flask pour servir le dossier build de React comme dossier statique
app.static_folder = react_build_path
app.static_url_path = ''

# Route pour servir l'app React
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    # Vérifier si le chemin correspond à un fichier statique dans le dossier build
    if path and (os.path.exists(os.path.join(react_build_path, path)) or 
                 os.path.exists(os.path.join(react_build_path, f"{path}.html"))):
        return send_from_directory(react_build_path, path)
    
    # Vérifier si le chemin correspond à un fichier dans static/js ou static/css
    if path.startswith('static/'):
        parts = path.split('/')
        if len(parts) >= 3:
            static_type = parts[1]  # js ou css
            filename = '/'.join(parts[2:])  # Le reste du chemin
            static_path = os.path.join(react_build_path, 'static', static_type)
            if os.path.exists(os.path.join(static_path, filename)):
                return send_from_directory(static_path, filename)
    
    # Par défaut, renvoyer l'index.html pour la SPA
    return send_from_directory(react_build_path, "index.html")

@app.route("/api/categories", methods=["GET"])
def get_categories():
    return jsonify({"categories": CATEGORIES})

@app.route("/generate_tasks", methods=["POST"])
def generate_simple_tasks():
    # Si la génération sophistiquée ne fonctionne pas
    data = request.json
    theme = data.get("theme", "")
    
    if not theme:
        return jsonify({"error": "Aucun thème fourni"}), 400
    
    # Générer des tâches basiques
    tasks = []
    for i in range(5):
        tasks.append({
            "id": i + 1,
            "text": f"Tâche {i+1} pour {theme}",
            "completed": False
        })
    
    return jsonify({"theme": theme, "tasks": tasks})

@app.route("/api/generate", methods=["POST"])
def generate_tasks():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Données invalides"}), 400
            
        theme = data.get("theme", "").strip()
        if not theme:
            return jsonify({"error": "Veuillez spécifier un thème"}), 400
        
        is_smart_objective = data.get("is_smart_objective", False)
            
        # Vérifier si le thème existe déjà
        all_tasks = load_tasks()
        if theme in all_tasks and not is_smart_objective:
            return jsonify({"theme": theme, "tasks": all_tasks[theme]})
        
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
                    - Détermine sa priorité selon la matrice d'Eisenhower (important_urgent, important_not_urgent, not_important_urgent, not_important_not_important)
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
        import re
        if is_smart_objective:
            # Pour les objectifs SMART, on cherche le JSON entier
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(0)
            
            try:
                data = json.loads(response_text)
                smart_objective = data.get("smart_objective", {})
                tasks = data.get("tasks", [])
                
                if not tasks:
                    return jsonify({"error": "Impossible de générer des tâches pour cet objectif"}), 500
                
            except json.JSONDecodeError as e:
                app.logger.error(f"Erreur JSON: {e}. Réponse brute: {response_text}")
                return jsonify({"error": "Erreur de format dans la réponse pour l'objectif SMART"}), 500
                
            # Ajouter l'objectif SMART aux tâches pour la sauvegarde
            all_tasks[theme] = {
                "smart_objective": smart_objective,
                "tasks": tasks
            }
            save_tasks(all_tasks)
            
            return jsonify({"theme": theme, "smart_objective": smart_objective, "tasks": tasks})
        else:
            # Pour les tâches normales, on cherche le tableau JSON
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                response_text = json_match.group(0)
            
            try:
                task = json.loads(response_text)
                # Convertir le résultat unique en liste avec un seul élément
                tasks = [task]
            except json.JSONDecodeError as e:
                app.logger.error(f"Erreur JSON: {e}. Réponse brute: {response_text}")
                return jsonify({"error": "Erreur lors de la génération des tâches. Format de réponse invalide."}), 500
            
            if not tasks or not isinstance(tasks, list):
                return jsonify({"error": "Format de réponse invalide"}), 500
                
            # Ajouter une catégorie à partir du premier hashtag s'il existe
            for task in tasks:
                # Ajouter completed=false à chaque tâche si ce n'est pas déjà fait
                if "completed" not in task:
                    task["completed"] = False
                    
                # Extraire la catégorie du premier hashtag
                if "hashtags" in task and isinstance(task["hashtags"], list) and len(task["hashtags"]) > 0:
                    task["category"] = task["hashtags"][0]
                else:
                    task["category"] = "autre"
                    
                # S'assurer que l'ID est un entier
                if "id" in task and not isinstance(task["id"], int):
                    try:
                        task["id"] = int(task["id"])
                    except (ValueError, TypeError):
                        task["id"] = random.randint(1000, 9999)
            
            # Sauvegarder les tâches par thème
            all_tasks[theme] = tasks
            save_tasks(all_tasks)
            
            return jsonify({"theme": theme, "tasks": tasks})
    
    except Exception as e:
        app.logger.error(f"Erreur lors de la génération des tâches: {str(e)}")
        return jsonify({"error": f"Erreur lors de la génération des tâches: {str(e)}"}), 500

# API pour récupérer les tâches d'un thème
@app.route("/api/tasks/<theme>", methods=["GET"])
def get_tasks(theme):
    all_tasks = load_tasks()
    tasks = all_tasks.get(theme, [])
    return jsonify({"theme": theme, "tasks": tasks})

# API pour mettre à jour une tâche
@app.route("/api/tasks/<theme>/<int:task_id>", methods=["PUT"])
def update_task(theme, task_id):
    data = request.json
    all_tasks = load_tasks()
    
    if theme not in all_tasks:
        return jsonify({"error": "Thème non trouvé"}), 404
    
    for task in all_tasks[theme]:
        if task.get("id") == task_id:
            # Vérifier que la catégorie est valide si elle est fournie
            if "category" in data and data["category"].lower() not in CATEGORIES:
                data["category"] = "autre"
                
            task.update(data)
            save_tasks(all_tasks)
            return jsonify({"success": True, "task": task})
    
    return jsonify({"error": "Tâche non trouvée"}), 404

# API pour supprimer une tâche
@app.route("/api/tasks/<theme>/<int:task_id>", methods=["DELETE"])
def delete_task(theme, task_id):
    all_tasks = load_tasks()
    
    if theme not in all_tasks:
        return jsonify({"error": "Thème non trouvé"}), 404
    
    for i, task in enumerate(all_tasks[theme]):
        if task.get("id") == task_id:
            del all_tasks[theme][i]
            save_tasks(all_tasks)
            return jsonify({"success": True})
    
    return jsonify({"error": "Tâche non trouvée"}), 404

# API pour récupérer tous les thèmes
@app.route("/api/themes", methods=["GET"])
def get_themes():
    all_tasks = load_tasks()
    themes = list(all_tasks.keys())
    return jsonify({"themes": themes})

@app.route("/api/recommendations", methods=["GET"])
def get_recommendations():
    """
    Génère des recommandations intelligentes de tâches à faire maintenant
    basées sur les priorités, le temps disponible, et les objectifs.
    """
    try:
        # Paramètres optionnels
        available_time = request.args.get("available_time", "30min")  # Temps disponible par défaut: 30min
        energy_level = request.args.get("energy_level", "medium")  # Niveau d'énergie par défaut: moyen
        
        # Charger toutes les tâches
        all_tasks = load_tasks()
        
        # Extraire toutes les tâches non complétées de tous les thèmes
        active_tasks = []
        for theme, tasks_data in all_tasks.items():
            # Vérifier si c'est un objectif SMART ou des tâches normales
            if isinstance(tasks_data, dict) and "smart_objective" in tasks_data:
                tasks = tasks_data.get("tasks", [])
            else:
                tasks = tasks_data
                
            for task in tasks:
                if not task.get("completed", False):
                    task["theme"] = theme  # Ajouter le thème à la tâche
                    active_tasks.append(task)
        
        if not active_tasks:
            return jsonify({"message": "Aucune tâche active trouvée", "recommendations": []}), 200
        
        # Trier les tâches par priorité Eisenhower et deadline
        prioritized_tasks = sorted(active_tasks, 
                                  key=lambda t: (
                                      eisenhower_priority_value(t.get("eisenhower", "")), 
                                      t.get("deadline", "9999-12-31")
                                  ))
        
        # Filtrer par temps disponible
        available_minutes = parse_time_to_minutes(available_time)
        filtered_tasks = [t for t in prioritized_tasks 
                         if parse_time_to_minutes(t.get("estimated_time", "1h")) <= available_minutes]
        
        # Prendre les 3 premières recommandations
        recommendations = filtered_tasks[:3] if filtered_tasks else prioritized_tasks[:3]
        
        # Générer un message de recommandation avec l'IA si nous avons des tâches
        if recommendations:
            client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
            
            # Construire le contexte pour l'IA
            recommendation_texts = [f"- {task['text']} ({task.get('estimated_time', 'durée inconnue')})" 
                                   for task in recommendations]
            
            response = client.chat.completions.create(
                model=os.environ.get("MODEL_OPENAI"),
                messages=[
                    {"role": "system", "content": "Tu es un assistant productivité qui donne des conseils motivants mais concis."},
                    {"role": "user", "content": f"J'ai {available_time} disponibles et mon niveau d'énergie est {energy_level}. Voici mes tâches prioritaires:\n" + "\n".join(recommendation_texts) + "\nQue me recommandes-tu de faire maintenant et pourquoi (en 1-2 phrases) ?"}
                ],
                temperature=0.7,
                max_tokens=150
            )
            
            recommendation_message = response.choices[0].message.content.strip()
        else:
            recommendation_message = f"Tu as {available_time} disponibles. C'est un bon moment pour planifier de nouvelles tâches ou faire une pause."
        
        return jsonify({
            "message": recommendation_message,
            "recommendations": recommendations
        })
        
    except Exception as e:
        app.logger.error(f"Erreur lors de la génération des recommandations: {str(e)}")
        return jsonify({"error": f"Erreur lors de la génération des recommandations: {str(e)}"}), 500

@app.route("/api/weekly-review", methods=["GET"])
def get_weekly_review():
    """
    Génère une rétro-analyse hebdomadaire des tâches accomplies et à venir.
    """
    try:
        # Charger toutes les tâches
        all_tasks = load_tasks()
        
        # Collecter des statistiques
        completed_tasks = []
        pending_tasks = []
        
        for theme, tasks_data in all_tasks.items():
            # Vérifier si c'est un objectif SMART ou des tâches normales
            if isinstance(tasks_data, dict) and "smart_objective" in tasks_data:
                tasks = tasks_data.get("tasks", [])
                is_smart = True
            else:
                tasks = tasks_data
                is_smart = False
                
            for task in tasks:
                task["theme"] = theme
                task["is_smart_objective"] = is_smart
                
                if task.get("completed", False):
                    completed_tasks.append(task)
                else:
                    pending_tasks.append(task)
        
        # Calculer les statistiques
        total_tasks = len(completed_tasks) + len(pending_tasks)
        completion_rate = round((len(completed_tasks) / total_tasks * 100) if total_tasks > 0 else 0, 1)
        
        # Collecter les données par catégorie (hashtags)
        categories = {}
        for task in completed_tasks + pending_tasks:
            for hashtag in task.get("hashtags", []):
                if hashtag not in categories:
                    categories[hashtag] = {"total": 0, "completed": 0}
                categories[hashtag]["total"] += 1
                if task in completed_tasks:
                    categories[hashtag]["completed"] += 1
        
        # Calculer les taux de complétion par catégorie
        for category, stats in categories.items():
            stats["completion_rate"] = round((stats["completed"] / stats["total"] * 100), 1)
        
        # Obtenir les objectifs SMART
        smart_objectives = []
        for theme, tasks_data in all_tasks.items():
            if isinstance(tasks_data, dict) and "smart_objective" in tasks_data:
                objective = tasks_data["smart_objective"]
                objective["theme"] = theme
                smart_objectives.append(objective)
        
        # Générer le résumé avec l'IA
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        
        # Construire le contexte pour l'IA
        context = f"""
        Statistiques de la semaine:
        - Taux de complétion global: {completion_rate}% ({len(completed_tasks)}/{total_tasks})
        - Tâches terminées: {len(completed_tasks)}
        - Tâches en attente: {len(pending_tasks)}
        
        Catégories:
        {json.dumps(categories, indent=2)}
        
        Objectifs SMART en cours:
        {json.dumps(smart_objectives, indent=2)}
        """
        
        response = client.chat.completions.create(
            model=os.environ.get("MODEL_OPENAI"),
            messages=[
                {"role": "system", "content": "Tu es un coach productivité qui analyse les performances hebdomadaires. Ta réponse doit être directe, concise mais motivante."},
                {"role": "user", "content": f"Voici mes statistiques de la semaine. Peux-tu me faire une analyse hebdomadaire concise en 3-5 phrases qui met en avant mes succès, ce qui a été négligé, et une suggestion pour la semaine suivante?\n{context}"}
            ],
            temperature=0.7,
            max_tokens=250
        )
        
        review_message = response.choices[0].message.content.strip()
        
        return jsonify({
            "message": review_message,
            "statistics": {
                "total_tasks": total_tasks,
                "completed_tasks": len(completed_tasks),
                "pending_tasks": len(pending_tasks),
                "completion_rate": completion_rate,
                "categories": categories
            },
            "smart_objectives": smart_objectives
        })
        
    except Exception as e:
        app.logger.error(f"Erreur lors de la génération de la rétrospective: {str(e)}")
        return jsonify({"error": f"Erreur lors de la génération de la rétrospective: {str(e)}"}), 500

# Fonctions utilitaires pour les recommandations
def eisenhower_priority_value(priority):
    """Convertit la priorité Eisenhower en valeur numérique pour le tri"""
    priority_values = {
        "important_urgent": 1,
        "important_not_urgent": 2,
        "not_important_urgent": 3,
        "not_important_not_urgent": 4
    }
    return priority_values.get(priority, 5)  # Valeur par défaut si la priorité n'est pas reconnue

def parse_time_to_minutes(time_str):
    """Convertit une chaîne de temps (comme '1h30min') en minutes"""
    if not time_str:
        return 60  # Valeur par défaut: 1 heure
        
    total_minutes = 0
    # Rechercher les heures
    hour_match = re.search(r'(\d+)h', time_str)
    if hour_match:
        total_minutes += int(hour_match.group(1)) * 60
        
    # Rechercher les minutes
    min_match = re.search(r'(\d+)min', time_str)
    if min_match:
        total_minutes += int(min_match.group(1))
        
    # Si aucun match n'a été trouvé, essayer de convertir directement
    if total_minutes == 0:
        try:
            # Essayer de convertir directement en minutes
            total_minutes = int(''.join(filter(str.isdigit, time_str)))
        except:
            total_minutes = 60  # Valeur par défaut
            
    return total_minutes

# Routes pour la gestion des habitudes
@app.route("/api/habits", methods=["GET"])
async def get_habits():
    """Récupère toutes les habitudes d'un utilisateur."""
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id est requis"}), 400
        
    habits = await habits_service.get_user_habits(user_id)
    return jsonify({"habits": habits})

@app.route("/api/habits", methods=["POST"])
async def add_habit():
    """Ajoute une nouvelle habitude."""
    data = request.json
    if not data:
        return jsonify({"error": "Données invalides"}), 400
        
    habit = await habits_service.add_habit(data)
    if not habit:
        return jsonify({"error": "Échec de l'ajout de l'habitude"}), 500
        
    return jsonify({"habit": habit}), 201

@app.route("/api/habits/<int:habit_id>", methods=["PUT"])
async def update_habit(habit_id):
    """Met à jour une habitude existante."""
    data = request.json
    if not data:
        return jsonify({"error": "Données invalides"}), 400
        
    updated_habit = await habits_service.update_habit(habit_id, data)
    if not updated_habit:
        return jsonify({"error": "Habitude non trouvée ou échec de la mise à jour"}), 404
        
    return jsonify({"habit": updated_habit})

@app.route("/api/habits/<int:habit_id>", methods=["DELETE"])
async def delete_habit(habit_id):
    """Supprime une habitude et ses entrées associées."""
    success = await habits_service.delete_habit(habit_id)
    if not success:
        return jsonify({"error": "Échec de la suppression de l'habitude"}), 500
        
    return jsonify({"success": True})

@app.route("/api/habits/<int:habit_id>/entries", methods=["GET"])
async def get_habit_entries(habit_id):
    """Récupère les entrées pour une habitude spécifique."""
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    
    entries = await habits_service.get_habit_entries(habit_id, start_date, end_date)
    return jsonify({"entries": entries})

@app.route("/api/habits/entries", methods=["POST"])
async def add_habit_entry():
    """Ajoute ou met à jour une entrée d'habitude."""
    data = request.json
    if not data:
        return jsonify({"error": "Données invalides"}), 400
        
    entry = await habits_service.add_habit_entry(data)
    if not entry:
        return jsonify({"error": "Échec de l'ajout de l'entrée"}), 500
        
    return jsonify({"entry": entry}), 201

@app.route("/api/habits/entries/<int:entry_id>", methods=["DELETE"])
async def delete_habit_entry(entry_id):
    """Supprime une entrée d'habitude."""
    success = await habits_service.delete_habit_entry(entry_id)
    if not success:
        return jsonify({"error": "Échec de la suppression de l'entrée"}), 500
        
    return jsonify({"success": True})

@app.route("/api/habits/stats", methods=["GET"])
async def get_habit_stats():
    """Récupère les statistiques des habitudes pour un utilisateur."""
    user_id = request.args.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id est requis"}), 400
        
    habit_id = request.args.get("habit_id")
    if habit_id:
        habit_id = int(habit_id)
        
    period = request.args.get("period", "month")
    
    stats = await habits_service.get_habit_stats(user_id, habit_id, period)
    return jsonify(stats)

if __name__ == "__main__":
    app.run(debug=True) 