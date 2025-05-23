# Assistant Tasky – Mentor IA

Une application web intelligente combinant FastAPI & React pour générer, analyser et suivre vos tâches. Entièrement dockerisée et prête pour le cloud.

## 🚀 Stack technique

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + TypeScript + TailwindCSS |
| Backend  | FastAPI  (Python 3.11) |
| IA       | OpenAI / Ollama (LLM) |
| DB       | Supabase (PostgreSQL) |
| Infra    | Docker & Docker-Compose (local) – GitHub Actions CI/CD (prod) |

---

## 🖥️ Démarrage local rapide

```bash
# 1. Cloner le repo
 git clone https://github.com/<user>/Tasky.git && cd Tasky

# 2. Copier les variables d'environnement
 cp .env.example .env
 # 👉  Renseigner vos clés (OPENAI_API_KEY, SUPABASE_URL, etc.)

# 3. Lancer toute la stack
 docker-compose up --build
```

• Backend : http://localhost:8000/api/docs  
• Frontend : http://localhost:3000

---

## ⚙️ Structure des dossiers (simplifiée)

```
backend/
  app/
    main.py          # Point d'entrée FastAPI
    config.py        # Paramètres centralisés (Pydantic Settings)
    ...
frontend/
  src/               # React + Vite
infrastructure/
  docker-compose.yml # Orchestration local/prod
.github/workflows/
  ci.yml             # Tests & lint
  cd.yml             # Déploiement VM/Cloud
```

---

## ☁️ Déploiement cloud (VM Linux)

1. **Configurer les secrets GitHub** dans _Repository > Settings > Secrets_ :
   - `VM_HOST`, `VM_USER`, `VM_SSH_KEY` (clé privée)
2. Un push sur `main` déclenchera :
   - Build des images Docker
   - `ssh` sur la VM
   - `docker-compose pull && docker-compose up -d`

> Le workflow GitHub Actions se trouve dans `.github/workflows/cd.yml`.

---

## 🧪 Tests

```bash
make test      # ou  docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

---

## ✨ Roadmap courte

- [ ] Authentification JWT + RBAC
- [ ] Mode hors-ligne avec Service Workers
- [ ] Monitoring Prometheus / Grafana
- [ ] CDN & optimisation images

Contributions bienvenues ! 💙


