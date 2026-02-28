# AgriConnect

Plateforme de mise en relation agricole à Madagascar.

## Structure du projet

- **backend/**: API REST développée avec FastAPI.
- **frontend/**: Application web développée avec Next.js.
- **mobile/**: Application mobile développée avec Expo/React Native.
- **docs/**: Documentation du projet.

## Installation

### Backend

1. Se rendre dans le dossier `backend`.
2. Créer un environnement virtuel : `python -m venv venv`.
3. Activer l'environnement : `source venv/bin/activate` (Linux) ou `venv\Scripts\activate` (Windows).
4. Installer les dépendances : `pip install -r requirements.txt`.
5. Lancer le serveur : `uvicorn app.main:app --reload`.

### Frontend

1. Se rendre dans le dossier `frontend`.
2. Installer les dépendances : `npm install`.
3. Lancer l'application : `npm run dev`.

### Mobile

1. Se rendre dans le dossier `mobile`.
2. Installer les dépendances : `npm install`.
3. Lancer avec Expo : `npx expo start`.

## Contribution

Les contributions sont les bienvenues. Veuillez vous assurer que le fichier `.gitignore` est respecté lors de vos commits.
