from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import json
import os
import requests
import re
from dotenv import load_dotenv


# Chargement des variables d'environnement depuis le fichier .env
load_dotenv()

app = Flask(__name__)
CORS(app)  # Permet les requêtes cross-origin

# Stockage simple - fichier JSON
TASKS_FILE = "tasks.json"


def load_tasks():
    if os.path.exists(TASKS_FILE):
        with open(TASKS_FILE, "r") as f:
            return json.load(f)
    return {}


def save_tasks(tasks):
    with open(TASKS_FILE, "w") as f:
        json.dump(tasks, f, indent=2)


def generate_with_ollama(theme):
    prompt = f"""Tu es un assistant qui génère des listes de tâches détaillées et pratiques.
    Génère une liste de tâches pour le thème '{theme}'.
    Donne-moi 5 à 10 tâches concrètes sous forme de liste JSON avec des clés 'id' et 'text'.
    Ne mets aucun texte avant ou après le JSON."""
    
    # Récupération du modèle à utiliser depuis les variables d'environnement
    model = os.environ.get("OLLAMA_MODEL", "llama3")
    
    # Appel à l'API Ollama (ajustez l'URL si besoin)
    response = requests.post(
        'http://localhost:11434/api/generate', 
        json={
            'model': model,
            'prompt': prompt,
            'stream': False
        }
    )
    
    if response.status_code == 200:
        return response.json()['response']
    else:
        raise Exception(f"Erreur Ollama: {response.status_code}")


# Route principale - sert l'application React
@app.route("/")
def index():
    return render_template("index.html")


# API pour générer des tâches
@app.route("/api/generate", methods=["POST"])
def generate_tasks():
    data = request.json
    theme = data.get("theme", "")
    
    if not theme:
        return jsonify({"error": "Aucun thème fourni"}), 400
    
    try:
        # Génération avec Ollama
        tasks_text = generate_with_ollama(theme)
        
        # Extraire le JSON des réponses potentiellement mélangées
        json_match = re.search(r'\[.*\]', tasks_text, re.DOTALL)
        if json_match:
            tasks_text = json_match.group(0)
        
        tasks = json.loads(tasks_text)
        
        # Ajouter completed=false à chaque tâche
        for task in tasks:
            task["completed"] = False
        
        # Sauvegarder les tâches par thème
        all_tasks = load_tasks()
        all_tasks[theme] = tasks
        save_tasks(all_tasks)
        
        return jsonify({"theme": theme, "tasks": tasks})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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


if __name__ == "__main__":
    app.run(debug=True) 