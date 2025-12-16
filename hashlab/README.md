Plateforme de cracking de hash avec Flask, React, Redis, Celery

HashLab: Plateforme moderne de cracking de hash : async, multistratégies, interface professionnelle

1. Présentation

HashLab est une plateforme complète permettant :

la création de jobs de cracking (MD5, SHA1, etc.)

l’utilisation de plusieurs stratégies (dictionary, bruteforce, hybrid)

un traitement asynchrone via Celery

une UI moderne faite avec React + Tailwind

un suivi temps réel des jobs

Ce projet a été réalisé dans le cadre d’un module avancé en développement logiciel et architecture applicative.

2. Fonctionnalités principales
   Authentification

Inscription / Connexion

JWT automatique

Routes protégées

Cracking

Stratégie Dictionary

Stratégie Bruteforce configurable

Stratégie Hybrid (variantes automatiques)

File d’attente via Celery

Stockage des résultats (plaintext, durée, essais…)

Outils Hash

Hash d’un texte

Vérification de hash

Hash d’un fichier

Password Tools

Générateur de mot de passe

Analyse de robustesse

Interface React

Login

Dashboard

Liste des jobs

Formulaire avancé de création de job

Outils hash + mot de passe

3. Architecture
   hashlab/
   │
   ├── backend/
   │ ├── app/
   │ │ ├── routes/
   │ │ ├── cracking/
   │ │ ├── tasks/
   │ │ ├── models.py
   │ │ ├── extensions.py
   │ │ ├── config.py
   │ │ └── **init**.py
   │ │
   │ ├── celery_app.py
   │ ├── wsgi.py
   │ └── instance/hashlab.db
   │
   ├── frontend/hashlab-ui/
   │ ├── src/
   │ │ ├── pages/
   │ │ ├── layouts/
   │ │ ├── context/
   │ │ ├── api/
   │ │ └── App.jsx
   │ ├── index.html
   │ └── package.json
   │
   └── start.sh / stop.sh

4. Installation
   Prérequis

Python 3.12

Node.js 18+

Redis installé :

brew install redis

🟦 Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Première initialisation de la base

rm -f instance/hashlab.db
flask --app backend.wsgi shell <<EOF
from backend.app.extensions import db
from backend.app import create_app
app = create_app()
with app.app_context():
db.create_all()
EOF

🟦 Frontend
cd frontend/hashlab-ui
npm install
npm run dev

5. Scripts Start / Stop
   start.sh
   #!/bin/bash
   echo "Démarrage de HashLab..."

echo "Redis..."
brew services start redis

echo "Backend..."
cd backend
source venv/bin/activate
python -m backend.wsgi &
BACKEND_PID=$!

echo "Celery..."
celery -A backend.celery_app.celery worker --loglevel=info &
CELERY_PID=$!

echo "Frontend..."
cd ../frontend/hashlab-ui
npm run dev &
FRONT_PID=$!

echo $BACKEND_PID > ../backend.pid
echo $CELERY_PID > ../celery.pid
echo $FRONT_PID > ../frontend.pid

echo "Tous les services démarrés !"

stop.sh
kill $(cat backend.pid)
kill $(cat celery.pid)
kill $(cat frontend.pid)
brew services stop redis

6. API Overview
   Auth
   Méthode Route Description
   POST /auth/register Inscription
   POST /auth/login Login + JWT
   Jobs
   Méthode Route Description
   POST /jobs Créer un job
   GET /jobs/me Voir mes jobs
   GET /jobs/:id Statut d’un job
   Hash Tools

| POST /hash/hash |
| POST /hash/verify |
| POST /hash/hash/file |

Password Tools

| GET /password/generate |
| POST /password/strength |

7. UI Overview

Login sécurisé

Dashboard statistiques

Table des jobs

Job en temps réel

Formulaire complet (dictionary / bruteforce / hybrid)

Hash Tools (texte & fichier)

Password Tools (générateur + analyseur)

8. Perspectives d’évolution

WebSockets : mise à jour temps réel du job

File d’attente multi-niveaux

Upload dictionnaire custom

Support SHA-256, bcrypt, Argon2

Annulation d’un job en cours

Monitoring Celery dans l’UI

9. Auteurs

Guissi — Développeur Fullstack du projet HashLab
Contact : mohamed.guissim@gmail.com 
