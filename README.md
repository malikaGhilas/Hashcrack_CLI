HashLab — Plateforme moderne de cracking de hash
Présentation

HashLab est une plateforme complète de cracking de hash conçue autour d’une architecture asynchrone, scalable et orientée performance.
Elle combine Flask, Celery, Redis et React afin de proposer un système robuste de gestion de jobs de cracking multi-stratégies avec suivi précis de l’exécution.

Ce projet a été réalisé dans le cadre d’un module avancé de développement logiciel et d’architecture applicative.

Fonctionnalités
Authentification

Inscription et connexion des utilisateurs

Authentification basée sur JWT

Protection des routes API

Isolation des jobs par utilisateur

Cracking de hash

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

Outils de hash

Génération de hash à partir d’un texte

Vérification de hash

Outils mot de passe

Générateur de mots de passe

Analyse de robustesse (longueur, complexité, entropie)

Interface web

Authentification sécurisée

Tableau de bord avec statistiques

Liste et suivi des jobs

Formulaire avancé de création de job

Outils hash et mot de passe intégrés

Interface moderne réalisée avec React et Tailwind CSS

Architecture du projet
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

Installation
Prérequis

Python 3.12

Node.js 18 ou supérieur

Redis installé localement

brew install redis

Installation du backend
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

Installation du frontend
cd frontend/hashlab-ui
npm install
npm run dev

Démarrage et arrêt des services
start.sh
#!/bin/bash
echo "Démarrage de HashLab..."

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

echo "Tous les services sont démarrés."

stop.sh
kill $(cat backend.pid)
kill $(cat celery.pid)
kill $(cat frontend.pid)
brew services stop redis

API Overview
Authentification
Méthode	Route	Description
POST	/auth/register	Inscription
POST	/auth/login	Connexion et génération du JWT
Jobs
Méthode	Route	Description
POST	/jobs	Créer un job
GET	/jobs/me	Lister les jobs de l’utilisateur
GET	/jobs/:id	Statut d’un job
Outils Hash
Méthode	Route
POST	/hash/hash
POST	/hash/verify
POST	/hash/hash/file
Outils Mot de Passe
Méthode	Route
GET	/password/generate
POST	/password/strength
Perspectives d’évolution

Suivi temps réel via WebSockets

Gestion de files d’attente multi-priorités

Upload de dictionnaires personnalisés

Support d’algorithmes supplémentaires (SHA-256, bcrypt, Argon2)

Annulation de jobs en cours

Monitoring Celery intégré à l’interface

Auteur

Mohamed Guissi
Développeur Full-Stack

Contact : mohamed.guissim@gmail.com
