HashLab — Plateforme de cracking de hash
1. Présentation générale

HashLab est une plateforme complète de cracking de hash conçue autour d’une architecture asynchrone, scalable et orientée performance.

Elle repose sur l’association de Flask, Celery, Redis et React afin de proposer un système robuste de gestion de jobs de cracking multi-stratégies avec suivi précis de l’exécution.

Ce projet a été réalisé dans le cadre d’un module avancé de développement logiciel et d’architecture applicative.

2. Fonctionnalités principales
2.1 Authentification

Inscription et connexion des utilisateurs

Authentification basée sur JWT

Protection des routes API

Isolation des jobs par utilisateur

2.2 Cracking de hash

Algorithmes supportés :

MD5

SHA-1

Stratégies de cracking :

Attaque par dictionnaire

Attaque bruteforce configurable

Attaque hybride (variantes automatiques)

Exécution asynchrone via Celery

File d’attente Redis

Persistance des résultats :

Mot de passe en clair

Temps d’exécution

Nombre d’essais

Statut du job

2.3 Outils de hash

Génération de hash à partir d’un texte

Vérification de hash

Hash d’un fichier

2.4 Outils mot de passe

Générateur de mots de passe

Analyse de robustesse (longueur, complexité, entropie)

2.5 Interface web

Authentification sécurisée

Tableau de bord avec statistiques

Liste et suivi des jobs

Formulaire avancé de création de job

Outils hash et mot de passe intégrés

Interface moderne développée avec React et Tailwind CSS

3. Architecture du projet
hashlab/
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── cracking/
│   │   ├── tasks/
│   │   ├── models.py
│   │   ├── extensions.py
│   │   ├── config.py
│   │   └── __init__.py
│   │
│   ├── celery_app.py
│   ├── wsgi.py
│   └── instance/hashlab.db
│
├── frontend/
│   └── hashlab-ui/
│       ├── src/
│       │   ├── pages/
│       │   ├── layouts/
│       │   ├── context/
│       │   ├── api/
│       │   └── App.jsx
│       ├── index.html
│       └── package.json
│
└── start.sh / stop.sh

4. Installation
4.1 Prérequis

Python 3.12

Node.js 18 ou supérieur

Redis installé localement

brew install redis

4.2 Installation du backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

Initialisation de la base de données
rm -f instance/hashlab.db

flask --app backend.wsgi shell <<EOF
from backend.app.extensions import db
from backend.app import create_app

app = create_app()
with app.app_context():
    db.create_all()
EOF

4.3 Installation du frontend
cd frontend/hashlab-ui
npm install
npm run dev

5. Démarrage et arrêt des services
5.1 Script de démarrage (start.sh)
#!/bin/bash
brew services start redis

cd backend
source venv/bin/activate
python -m backend.wsgi &
echo $! > ../backend.pid

celery -A backend.celery_app.celery worker --loglevel=info &
echo $! > ../celery.pid

cd ../frontend/hashlab-ui
npm run dev &
echo $! > ../frontend.pid

5.2 Script d’arrêt (stop.sh)
kill $(cat backend.pid)
kill $(cat celery.pid)
kill $(cat frontend.pid)
brew services stop redis

6. API Overview
6.1 Authentification
Méthode	Route	Description
POST	/auth/register	Inscription
POST	/auth/login	Connexion et génération du JWT
6.2 Jobs
Méthode	Route	Description
POST	/jobs	Créer un job
GET	/jobs/me	Lister les jobs
GET	/jobs/:id	Statut d’un job
6.3 Outils Hash
Méthode	Route
POST	/hash/hash
POST	/hash/verify
POST	/hash/hash/file
6.4 Outils Mot de Passe
Méthode	Route
GET	/password/generate
POST	/password/strength
7. Perspectives d’évolution

Suivi temps réel via WebSockets

Files d’attente multi-priorités

Upload de dictionnaires personnalisés

Support d’algorithmes avancés (SHA-256, bcrypt, Argon2)

Annulation de jobs en cours

Monitoring Celery intégré à l’interface
