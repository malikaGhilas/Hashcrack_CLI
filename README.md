# Hashcrack_CLI

**Résumé**  
Service web pédagogique permettant de tenter de retrouver un mot de passe à partir de son hash (MD5 / SHA1 / SHA256...). Le service accepte des requêtes via une API REST, peut fonctionner en mode synchrone (réponse immédiate pour petites tâches) ou asynchrone (jobs en file d’attente pour attaques longues). Conçu pour un contexte de TP : démonstration, tests et apprentissage.

---

## Stack technique
- Langage : **Python 3.10+**
- API Web : **Flask**
- Tâches asynchrones : **Celery + Redis**
- Base de données : **SQLite** (dev) / PostgreSQL (prod)
- Gestion de version : **Git / GitHub**
- Front simple : **HTML / CSS / JS**
- Tests : **pytest**

---

## Fonctionnalités principales
- Endpoint `POST /api/v1/crack` (mode `sync` ou `async`)
- Endpoint `GET /api/v1/jobs/<job_id>` pour récupérer le statut/résultat d’un job
- Mode auto-détection d’algorithme (quand l’algorithme n’est pas fourni)
- Strategies : dictionnaire (wordlist) et brute-force (limité)
- Gestion des quotas / rate-limiting (prévu via Flask-Limiter + Redis)
- Authentification par **API key** (recommandée pour les robots / batchs)
- Observabilité minimale (logs + endpoint `/api/v1/health`)

---

## Architecture (haut niveau)
Clients → Flask API → (si async) Queue Redis/Celery → Workers (exécutent strategies) → DB (jobs/results)

---

## Installation rapide (dev)
> Pré-requis : Python 3.10+, Docker (optionnel), Redis (local ou Docker)

1. Clone le repo :
```bash
git clone <repo-url>
cd hash_cracker
