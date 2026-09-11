# Tetra Mack & Co — Site + Espace administrateur

Application de production (Next.js / Prisma / SQLite) pour le restaurant Tetra Mack & Co,
construite à partir du prototype front-end et du cahier des charges fournis.

## Stack

- **Next.js** (App Router) — site public (SSR) + routes API pour l'admin
- **SQLite + Prisma** — base de données fichier, aucune dépendance externe
- **bcryptjs + jose (JWT)** — authentification admin (mot de passe haché, session httpOnly)
- **sharp** — validation et compression des photos uploadées (stockage disque local, `public/uploads/`)
- **Resend** — envoi de l'e-mail du formulaire de contact

## Installation

```bash
npm install
cp .env.example .env
```

Éditer `.env` :
- `SESSION_SECRET` : générer une valeur aléatoire longue, ex. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `RESEND_API_KEY` : clé API Resend (https://resend.com/api-keys) pour que le formulaire de contact envoie réellement des e-mails
- `CONTACT_FROM_EMAIL` : adresse d'expédition (domaine vérifié dans Resend, sinon `onboarding@resend.dev` en test)

## Initialiser la base de données

```bash
npx prisma migrate dev --name init
npm run db:seed
```

Le seed importe l'intégralité du contenu déjà validé (config, 15 catégories, 69 plats, actualités)
depuis `prisma/seed-data.json`, et crée le compte admin avec le mot de passe **haché** défini par
`ADMIN_INITIAL_PASSWORD` (ou `tetramack2026` par défaut). `mustChangePassword` est mis à `true` :
la première connexion à `/admin/login` imposera un changement de mot de passe avant tout accès au
tableau de bord.

## Lancer en développement

```bash
npm run dev
```

Site public : http://localhost:3000
Espace admin : http://localhost:3000/admin/login

## Sécurité — ce qui a changé par rapport au prototype

- Mot de passe admin **haché** (bcrypt), jamais transmis ni comparé en clair côté client.
- Session admin via cookie **httpOnly + secure (en prod) + sameSite**, signé (JWT).
- **Modale de changement de mot de passe obligatoire** à la première connexion — bloquante côté
  UI *et* appliquée côté serveur : toutes les routes d'écriture de l'admin (`/api/admin/*`) sont
  refusées (403) tant que `mustChangePassword` est vrai, pas seulement masquées à l'écran.
- **Rate limiting** sur la connexion : verrouillage 15 minutes après 5 échecs.
- **Validation serveur** (zod) de toutes les entrées admin (catégories, plats, actualités, config).
- **Upload d'images** : le contenu réel du fichier est vérifié par `sharp` (pas seulement le
  type MIME déclaré ni l'extension), taille limitée, redimensionnement + recompression serveur
  avant écriture sur disque.
- La configuration publique (`GET` sur les pages publiques) ne renvoie **jamais** le hash du mot
  de passe ni les compteurs de tentatives — un sélecteur dédié (`lib/publicConfig.js`) exclut ces
  champs, pour éviter qu'ils ne finissent dans le payload envoyé au navigateur d'un visiteur.
- **Limite connue** : la session admin est un JWT signé sans état côté serveur (pas de table de
  sessions). "Déconnexion" supprime le cookie du navigateur, mais un jeton déjà copié ailleurs
  resterait valable jusqu'à son expiration (12h). Pour un unique compte admin, ce compromis est
  raisonnable ; si besoin d'une révocation immédiate, ajouter une table `Session` (ou un compteur
  `sessionVersion` sur `Config`) vérifiée à chaque requête.

## Stockage des photos

Les photos uploadées depuis l'admin sont enregistrées dans `public/uploads/` (ignoré par git).
Pour un déploiement sur une plateforme sans disque persistant (ex. Vercel), il faudra soit :
- utiliser un volume persistant (Railway, VPS, Fly.io…), soit
- remplacer `src/lib/image.js` par un client S3/Cloudinary (l'interface `processAndSaveImage`
  peut être adaptée sans toucher au reste de l'application).

## Déploiement

1. `npm run build`
2. Fournir les variables d'environnement de production (`.env.example`)
3. `npx prisma migrate deploy` puis `npm run db:seed` (une seule fois, au premier déploiement)
4. `npm start`

Sur Railway/VPS avec disque persistant : monter un volume sur le dossier contenant `dev.db`
(ou passer `DATABASE_URL` sur un chemin dans ce volume) et sur `public/uploads/`.

## Structure

```
prisma/schema.prisma       Modèle de données (Config, Category, Item, News)
prisma/seed.mjs            Import du contenu depuis seed-data.json
src/app/                   Pages publiques (/, /menu, /news, /contact) + /admin
src/app/api/               Routes API (contact, admin/*)
src/components/            Composants partagés (Header, Footer, MenuItemRow, DishCarousel…)
src/components/admin/      Composants du tableau de bord admin
src/lib/                   Auth, accès DB, allergènes, upload d'images, e-mail, validations
```
