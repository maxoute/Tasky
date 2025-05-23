# 🚀 Guide de Déploiement VM - Tasky/Mentor IA

## Prérequis VM

### 1. Installation Docker & Docker Compose

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installation Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Redémarrer la session
sudo reboot
```

### 2. Installation Git

```bash
sudo apt update
sudo apt install -y git curl
```

## Déploiement Automatique

### Option 1: Script de déploiement complet

```bash
# Télécharger et exécuter le script de déploiement
curl -fsSL https://raw.githubusercontent.com/maxoute/Tasky/main/deploy-vm.sh -o deploy-vm.sh
chmod +x deploy-vm.sh
sudo ./deploy-vm.sh
```

### Option 2: Déploiement manuel

```bash
# 1. Cloner le repository
sudo mkdir -p /opt/tasky
cd /opt/tasky
sudo git clone https://github.com/maxoute/Tasky.git .

# 2. Configurer les variables d'environnement
sudo cp backend/.env.example backend/.env
sudo nano backend/.env  # Éditer avec vos clés API

# 3. Lancer avec Docker Compose
sudo docker-compose up --build -d
```

## Configuration Backend (.env)

Créez/éditez le fichier `backend/.env` avec vos clés :

```env
# Configuration FastAPI
ENVIRONMENT=production
DEBUG=False
SECRET_KEY=votre-clé-secrète-super-forte
API_VERSION=v1

# Base de données Supabase
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_KEY=votre-clé-publique-supabase

# OpenAI API
OPENAI_API_KEY=sk-votre-clé-openai

# CORS (ajoutez l'IP de votre VM)
CORS_ORIGINS=["http://localhost:3000","http://VOTRE-IP-VM:3000"]
```

## Ports et Firewall

### Ouvrir les ports nécessaires :

```bash
# Ubuntu/Debian avec ufw
sudo ufw allow 22    # SSH
sudo ufw allow 3000  # Frontend
sudo ufw allow 8000  # Backend API
sudo ufw enable

# CentOS/RHEL avec firewalld
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=8000/tcp
sudo firewall-cmd --reload
```

## Services et URLs

Une fois déployé, l'application sera accessible via :

- **Frontend**: `http://VOTRE-IP-VM:3000`
- **Backend API**: `http://VOTRE-IP-VM:8000`
- **Documentation API**: `http://VOTRE-IP-VM:8000/docs`

## Commandes Utiles

```bash
# Voir le statut des conteneurs
sudo docker-compose ps

# Voir les logs en temps réel
sudo docker-compose logs -f

# Redémarrer l'application
sudo docker-compose restart

# Arrêter l'application
sudo docker-compose down

# Mettre à jour l'application
cd /opt/tasky
sudo git pull origin main
sudo docker-compose up --build -d

# Nettoyage Docker
sudo docker system prune -f
```

## Résolution de Problèmes

### Problème de permissions
```bash
sudo chown -R $USER:$USER /opt/tasky
```

### Vérifier les logs d'erreur
```bash
sudo docker-compose logs backend
sudo docker-compose logs frontend
```

### Redémarrage complet
```bash
sudo docker-compose down
sudo docker system prune -f
sudo docker-compose up --build -d
```

## Monitoring

### Surveiller l'utilisation des ressources
```bash
# CPU et mémoire des conteneurs
sudo docker stats

# Espace disque
df -h
sudo docker system df
```

## Sauvegardes

### Sauvegarder la configuration
```bash
# Sauvegarder le .env et docker-compose
sudo tar -czf tasky-backup-$(date +%Y%m%d).tar.gz backend/.env docker-compose.yml
```

## Support

En cas de problème :
1. Vérifiez les logs : `sudo docker-compose logs -f`
2. Vérifiez l'état des conteneurs : `sudo docker-compose ps`
3. Redémarrez les services : `sudo docker-compose restart`

---

💡 **Tip**: Configurez un cron job pour des mises à jour automatiques :
```bash
# Ajouter au crontab : mise à jour quotidienne à 3h du matin
0 3 * * * cd /opt/tasky && sudo git pull && sudo docker-compose up --build -d
``` 