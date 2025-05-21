# Assistant To-Do

Une application web simple et élégante pour générer des listes de tâches intelligentes basées sur des thèmes.

## Fonctionnalités

- Génération de to-do lists intelligentes à partir d'un thème
- Interface utilisateur moderne et réactive
- Possibilité de marquer les tâches comme terminées
- Édition et suppression des tâches
- Stockage des tâches par thème

## Stack technique

- **Frontend** : React avec TailwindCSS
- **Backend** : Python avec Flask
- **LLM** : OpenAI GPT-3.5
- **Stockage** : JSON

## Installation

### Prérequis

- Python 3.7+
- Node.js 14+
- Une clé API OpenAI

### Backend

1. Naviguez vers le dossier backend :
```
cd backend
```

2. Configurez vos variables d'environnement en éditant le fichier `.env` :
```
OPENAI_API_KEY=votre-clé-api
OLLAMA_MODEL=llama3  # Si vous utilisez Ollama
```

3. Installez les dépendances :
```
pip install -r requirements.txt
```

4. Démarrez le serveur Flask :
```
python app.py
```

Pour utiliser Ollama à la place d'OpenAI :
```
python app_ollama.py
```

### Frontend

1. Dans un autre terminal, naviguez vers le dossier frontend :
```
cd frontend
```

2. Installez les dépendances :
```
npm install
```

3. Démarrez l'application React :
```
npm start
```

4. Ouvrez votre navigateur à l'adresse `http://localhost:3000`

## Utilisation

1. Entrez un thème dans le champ de texte (par exemple : "ménage", "tourner des vidéos", "lire")
2. Cliquez sur "Générer"
3. Une liste de tâches sera générée en fonction du thème
4. Vous pouvez cocher les tâches terminées, les éditer ou les supprimer

## Utilisation avec la nouvelle API OpenAI

L'application utilise désormais la version la plus récente de l'API OpenAI. Le code a été mis à jour pour utiliser le client moderne. Voici un exemple d'utilisation similaire à celui fourni par l'utilisateur :

```python
import os
from openai import OpenAI
from dotenv import load_dotenv

# Chargement des variables d'environnement depuis le fichier .env
load_dotenv()

# Création du client OpenAI - l'API key est récupérée depuis les variables d'environnement
client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
)

# Dans notre application, on l'utilise ainsi :
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": "Tu es un assistant qui génère des listes de tâches détaillées et pratiques."},
        {"role": "user", "content": f"Génère une liste de tâches pour le thème '{theme}'."}
    ],
    temperature=0.7,
)
```

## Alternative avec Ollama

Pour utiliser Ollama localement au lieu d'OpenAI, vous pouvez:

1. Configurer le modèle Ollama dans le fichier `.env` :
```
OLLAMA_MODEL=llama3
```

2. Exécuter l'application avec Ollama :
```
python backend/app_ollama.py
```

Le fichier `backend/app_ollama.py` est déjà configuré pour utiliser Ollama. Assurez-vous de démarrer le service Ollama avant de lancer l'application.

# Lancement avec Docker Compose

```bash
docker-compose up --build
```

- Backend : http://localhost:8000
- Frontend : http://localhost:3000


