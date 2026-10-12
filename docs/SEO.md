# SEO SailingLoc

## Problème relevé par le professeur

Le retour indique : "Manque SSR, JavaScript contenu, page inspecter que la div root".

Cela signifie que SailingLoc est une application React rendue cote client : le HTML initial envoyé au navigateur contient surtout la balise racine React, puis le contenu public est injecte par JavaScript. C'est fonctionnel pour l'utilisateur, mais moins favorable au SEO qu'un rendu serveur ou qu'un prerender des pages publiques.

## Architecture actuelle

- Frontend : React 18 + Vite + React Router.
- Rendu : SPA client-side avec `BrowserRouter`.
- Backend : Express sert l'API et le build statique du frontend en production Render.
- Pas de Next.js, pas de SSR Node, pas de SSG natif.

Le projet ne prétend donc pas avoir un vrai SSR. Les corrections appliquées sont une mitigation SEO réaliste pour le MVP.

## Améliorations mises en place

- `react-helmet-async` configure avec `HelmetProvider`.
- Composant `SEO` centralise : title, meta description, canonical, Open Graph, Twitter Card, robots et JSON-LD.
- Titres et descriptions uniques sur les pages publiques principales :
  - accueil ;
  - bateaux ;
  - catégories ;
  - catalogue / produits ;
  - contact ;
  - pages légales ;
  - limites MVP.
- Fiche bateau avec SEO dynamique selon les données :
  - titre du bateau ;
  - localisation ;
  - type ;
  - capacité ;
  - prix par jour ;
  - image principale ;
  - JSON-LD `Product` / `Offer`.
- H1 clair sur les pages publiques.
- URLs bateaux avec slugs SEO :
  - exemple : `/boats/hanse-455-marseille`.
  - les anciennes URLs par identifiant restent compatibles.
- Slugs sans accents ni caractères spéciaux via `server/src/utils/slugify.js`.
- Script de backfill pour les annonces existantes : `cd server && npm run backfill:slugs`.
- Script de génération sitemap avec les bateaux approuves : `cd server && npm run generate:sitemap`.
- Pages admin, propriétaire, profil, réservations, paiement et authentification en `noindex`.
- `robots.txt` avec exclusion du back-office et des pages privées.
- `sitemap.xml` avec les pages publiques indexables.

## Limite restante

React Helmet modifie le DOM une fois l'application chargée par le navigateur. Cela amélioré les balises SEO visibles dans DevTools et par certains crawlers modernes, mais ne remplace pas un vrai SSR.

En inspectant le "View Source" HTML brut, on verra encore principalement le conteneur React. C'est la limite structurelle d'une SPA Vite.

## Recommandation future

Pour une version production orientée SEO avance, il faudrait choisir une de ces évolutions :

- migration vers Next.js avec SSR/SSG pour les pages publiques ;
- prerendering des routes publiques critiques au build ;
- génération dynamique d'un sitemap avec tous les bateaux approuves ;
- conservation de l'API Express en backend séparé ou migration progressive vers des routes server-side.

## Vérification

1. Ouvrir `/` puis vérifier le titre : `SailingLoc — Location de bateaux entre particuliers`.
2. Ouvrir `/boats` et vérifier la meta description dans DevTools.
3. Ouvrir une fiche bateau avec slug : `/boats/<slug-du-bateau>`.
4. Vérifier que le H1 contient le nom du bateau et sa ville.
5. Vérifier `robots.txt` : `/admin`, `/owner`, `/profile`, `/my-bookings` sont disallow.
6. Vérifier `sitemap.xml` : les pages publiques principales sont listées.
7. Vérifier que les pages privées renvoient `<meta name="robots" content="noindex,nofollow">` après chargement React.
