# Pikapika

Prototype d'application pour organiser des sorties entre parents, adultes et ados.

## 1. Tester en local (facultatif)

Si vous avez Node.js installé sur votre ordinateur :

```bash
npm install
npm run dev
```

Puis ouvrez l'adresse affichée dans le terminal (en général `http://localhost:5173`).

## 2. Mettre le code sur GitHub

1. Créez un compte sur [github.com](https://github.com) si vous n'en avez pas.
2. Créez un nouveau dépôt (bouton vert "New").
3. Uploadez-y tous les fichiers de ce dossier (GitHub permet de glisser-déposer des fichiers directement dans le navigateur, pas besoin de ligne de commande : bouton "Add file" > "Upload files").

## 3. Déployer sur Vercel

1. Créez un compte sur [vercel.com](https://vercel.com) (vous pouvez vous connecter directement avec votre compte GitHub).
2. Cliquez sur "Add New..." > "Project".
3. Sélectionnez le dépôt GitHub que vous venez de créer.
4. Vercel détecte automatiquement qu'il s'agit d'un projet Vite : ne changez rien, cliquez sur "Deploy".
5. Après 1 à 2 minutes, vous obtenez une adresse du type `https://recre-app-xxxx.vercel.app` que vous pouvez ouvrir depuis votre téléphone et ajouter à votre écran d'accueil.

## 4. Mettre à jour l'application

À chaque fois que vous voulez publier une modification :

1. Remplacez le fichier `src/App.jsx` par la nouvelle version.
2. Uploadez-le sur GitHub (dans le dépôt, ouvrez `src/App.jsx`, cliquez sur l'icône crayon "Edit", collez le nouveau contenu, puis "Commit changes").

Vercel republie automatiquement le site à chaque modification sur GitHub — la nouvelle version est en ligne en moins d'une minute, sans aucune manipulation supplémentaire de votre part.

## Notes importantes

- **Carte réelle (Leaflet / OpenStreetMap)** : l'application utilise maintenant un vrai fond de carte. Comme ce sont de nouvelles dépendances (`leaflet`, `react-leaflet`), pensez à aussi mettre à jour le fichier `package.json` sur GitHub (pas seulement `App.jsx`) la première fois — sinon Vercel ne saura pas les installer. Ensuite, Vercel les installera automatiquement à chaque déploiement.
- **Les données ne sont pas sauvegardées** : les sorties créées ou les inscriptions disparaissent si la page est rechargée. C'est un prototype d'interface, pas une application connectée à une base de données.
- Le plan gratuit ("Hobby") de Vercel est largement suffisant pour cet usage : il est réservé à un usage personnel / non commercial, ce qui correspond à ce projet.
