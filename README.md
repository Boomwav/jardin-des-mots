# 🥕 Jardin des Mots

Application ludique d'apprentissage de mots basée sur un serveur Express.js et une interface utilisateur Angular.

Le projet est entièrement conteneurisé grâce à Docker Compose, ce qui permet un démarrage rapide et sans installation de dépendances locales.

## 🛠️ Technologies Utilisées

Composant	Technologie	Description
Frontend	Angular 17+ (Standalone)	Interface utilisateur et logique de jeu.
Backend (API)	Node.js (Express)	API REST simple pour lire/écrire la base de données.
Base de données	Fichier db.json	Base de données simple basée sur un fichier JSON (persistant via Volume Docker).
Conteneurisation	Docker & Docker Compose	Orchestration complète du projet.

## 🚀 Démarrage du Projet (Mode Docker)

La méthode recommandée pour lancer l'application est d'utiliser Docker Compose.

## Prérequis

    Docker Desktop (ou Docker Engine) installé et en cours d'exécution.

    Le fichier de configuration de la base de données db.json doit exister à l'emplacement que vous avez configuré (ou dans le dossier backend/data/ si vous utilisez la méthode du montage de dossier).

### Lancement

À la racine du projet (où se trouve le fichier docker-compose.yml), exécutez la commande suivante. Elle va construire les images Angular (frontend) et Node.js (backend), créer un réseau interne et démarrer les deux services.
    
    Bash

    docker-compose up --build -d

### Accès à l'Application

    Interface Utilisateur (Frontend) :
    http://localhost:8080

    API Backend (Test) :
    http://localhost:3000/api/data

## Arrêt des Services

Pour arrêter et supprimer les conteneurs :

    Bash

    docker-compose down

## 📂 Structure du Projet

    jardin-des-mots/
    ├── backend/                  # Contient le serveur Node.js (API)
    │   ├── server.js             # Logique API
    │   ├── Dockerfile            # Build du conteneur Node.js
    │   └── package.json
    ├── frontend/                 # Contient l'application Angular
    │   ├── src/                  # Code source Angular
    │   ├── Dockerfile.frontend   # Build de l'application Angular (Nginx)
    │   └── nginx.conf            # Configuration Nginx pour le routing et le proxy API
    ├── db.json                   # Base de données persistante (si non montée via volume)
    └── docker-compose.yml        # Fichier d'orchestration

## ⚠️ Note sur la Persistance des Données

Ce projet utilise un Volume Docker pour garantir que le fichier db.json persiste entre les redémarrages des conteneurs.

    Emplacement Interne au Conteneur : /app/db.json

    Emplacement Externe (Hôte) : Vérifiez la section volumes dans docker-compose.yml pour connaître le chemin exact de votre machine (ex: D:/.../db.json). Les modifications apportées en jeu seront sauvegardées directement dans ce fichier sur votre disque dur.
