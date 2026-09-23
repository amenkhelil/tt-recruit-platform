# TT Recruit System

Plateforme de recrutement développée pour Tunisie Telecom, intégrant une analyse de CV par Intelligence Artificielle (via LLM local) pour un scoring de pertinence optimisé, tout en garantissant la confidentialité absolue des données des postulants.

## Architecture

Le projet est divisé en trois briques principales :
- **Frontend** : Application React (Vite, TailwindCSS) pour les Candidats et Recruteurs.
- **Backend** : API Node.js (Express, MongoDB) orchestrant la logique métier et l'authentification.
- **AI Service** : Microservice Python (FastAPI) s'interfaçant avec un modèle LLM local via Ollama pour l'extraction de compétences et l'évaluation sémantique.

---

## DevOps / DevSecOps Setup

Cette section explique comment déployer l'application en utilisant Docker Compose et détaille les pipelines CI implémentés via GitHub Actions.

### Prérequis
1. **Docker Desktop** (ou Docker Engine + Docker Compose).
2. **Ollama** : Doit être installé et tourner *directement sur votre machine hôte* (pas dans Docker) pour des raisons de performances GPU.
   - Téléchargez Ollama sur [ollama.com](https://ollama.com).
   - Installez et lancez le modèle : `ollama run qwen2.5:7b`.

### Configuration de l'environnement
Copiez les fichiers d'exemple pour créer vos propres configurations :
- `frontend/.env.example` -> `frontend/.env`
- `backend/.env.example` -> `backend/.env`
- `AI-service/.env.example` -> `AI-service/.env`

*(Note : Pour le déploiement avec Docker Compose, les valeurs par défaut définies dans `docker-compose.yml` surchargeront l'environnement pour assurer la connexion entre les conteneurs).*

### Démarrage avec Docker Compose

L'ensemble de l'application (Frontend, Backend, AI-Service, MongoDB) peut être lancé d'une seule commande.

```bash
# Construire et démarrer les conteneurs en arrière-plan
docker compose up --build -d
```

- **Frontend** sera accessible sur : `http://localhost:5173`
- **Backend** (API) sera accessible sur : `http://localhost:5000/api`
- **AI Service** sera accessible sur : `http://localhost:8000/health`
- **MongoDB** sera accessible sur : `localhost:27017`

### Arrêt de l'application
```bash
docker compose down
```
*(Ajoutez `-v` si vous souhaitez également supprimer le volume de base de données MongoDB persistant).*

---

### Intégration Continue (GitHub Actions)

Le fichier `.github/workflows/ci.yml` automatise les vérifications à chaque `push` ou `pull_request` sur la branche `main`.
Le pipeline effectue les étapes suivantes :
1. **Frontend** : Installation des dépendances et validation du build de production (`npm run build`).
2. **Backend** : Validation de la syntaxe de base et démarrage.
3. **AI Service** : Installation des bibliothèques Python et validation des imports FastAPI.
4. **Analyse Code Quality (SonarCloud)** : Recherche de bugs et vulnérabilités de code.
5. **Scan de Sécurité (Trivy)** : Build des images Docker à la volée et scan Aqua Security Trivy (échoue si des failles *CRITICAL* ou *HIGH* sont trouvées dans l'OS ou les librairies).

### Configuration SonarCloud (GitHub)
Pour que l'analyse de code SonarCloud fonctionne dans vos GitHub Actions :
1. Créez un compte gratuit sur [sonarcloud.io](https://sonarcloud.io).
2. Liez votre dépôt GitHub et créez un projet avec la clé définie dans `sonar-project.properties`.
3. Récupérez le token généré et ajoutez-le dans les *Secrets* de votre dépôt GitHub sous le nom `SONAR_TOKEN`.

### Dépannage (Troubleshooting)

- **L'IA ne répond pas (Timeout) dans Docker** :
  Vérifiez que Ollama tourne bien sur votre machine hôte. Le conteneur `ai-service` essaie de le joindre via `host.docker.internal:11434`. Sous Windows/Mac avec Docker Desktop, cela fonctionne nativement. Sous Linux natif, vous devrez peut-être ajouter `--add-host host.docker.internal:host-gateway` (déjà configuré dans le docker-compose).
- **Problème de connexion MongoDB** :
  Vérifiez que le conteneur `mongodb` tourne via `docker ps`. Si vous avez un conflit de port, assurez-vous qu'aucun autre MongoDB ne tourne localement sur le port 27017.
- **Le scan Trivy échoue dans la CI** :
  Cela signifie qu'une librairie utilisée dans `package.json` ou `requirements.txt` a une faille de sécurité majeure (HIGH/CRITICAL). Mettez à jour la dépendance incriminée et relancez le pipeline.
