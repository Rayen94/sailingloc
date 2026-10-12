# Audit SEO / SSR SailingLoc

## Mode de rendu actuel

SailingLoc est une SPA React/Vite rendue cote client.

Preuves dans le code :

- `client/package.json` utilise `vite`, `react`, `react-dom` et `react-router-dom`.
- `client/src/main.jsx` monte l'application avec `ReactDOM.createRoot(document.getElementById('root')).render(...)`.
- `client/src/App.jsx` utilise `BrowserRouter`.
- `client/vite.config.js` ne contient pas de configuration SSR ou prerender.
- Le serveur Express sert le build statique du frontend, mais ne rend pas les pages React cote serveur.

Conclusion : il n'y a pas de vrai SSR aujourd'hui.

## État SSR / SSG / prerender

- SSR : absent.
- SSG : absent.
- Prerender : absent.
- Metadata dynamiques : présentes via `react-helmet-async`.
- URLs slug : présentes pour les fiches bateaux.

## Retour professeur

Le professeur a indique que l'inspection du HTML initial ne montre que la div root. Ce constat est exact pour une SPA. Les contenus sont injectes par JavaScript après chargement du bundle.

## Corrections appliquées

La solution retenue est une mitigation SEO MVP, sans migration lourde :

- ajout ou vérification de `react-helmet-async` ;
- composant `SEO` centralise ;
- meta title/description par page ;
- fiche bateau avec metadata dynamiques ;
- canonical sur fiches bateaux ;
- JSON-LD produit/offre sur fiche bateau ;
- pages privées et admin en `noindex` ;
- robots.txt propre ;
- sitemap.xml public ;
- slugs bateaux sans accents ni caractères spéciaux.

## Pourquoi ne pas migrer en SSR maintenant

Une migration SSR complète vers Next.js ou vers un serveur React SSR changerait fortement :

- le routing ;
- le build ;
- le déploiement Render ;
- la gestion des données initiales ;
- les pages protégées admin/owner ;
- les flux authentification, paiement et réservation.

Pour un projet de fin d'année proche du rendu, le risque de régression est supérieur au gain immédiat. La correction appliquée est donc honnête : SEO amélioré, mais pas vrai SSR.

## Limite a expliquer en soutenance

Le projet reste une SPA React. Les balises SEO sont injectées dynamiquement par React Helmet après chargement JavaScript. Cela amélioré l'indexabilite pour les crawlers modernes, mais le HTML source initial ne contient pas encore tout le contenu public.

Pour une version production SEO avancée, une migration vers Next.js SSR/SSG ou un prerendering des pages publiques est recommandée.

## Option future : prerender

Un prerender statique pourrait être ajoute pour :

- `/` ;
- `/boats` ;
- `/categories` ;
- `/products` ;
- `/contact`.

Il faudrait cependant tester soigneusement les routes dynamiques, l'hydratation React, les appels API Render et les pages protégées. Cette évolution est notée comme amélioration future, pas comme correction MVP.

