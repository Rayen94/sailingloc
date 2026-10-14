# Audit complet du site web SailingLoc

Date d'audit : 22 juillet 2026  
URL de production : https://dsp-dev-o24a-g6-fr.onrender.com/  
Dépôt : https://github.com/zerkor/sailingloc

## 1. Présentation du site

SailingLoc est une plateforme de location de bateaux entre particuliers. Le site vise trois profils :

- locataire : rechercher un bateau, consulter une fiche, réserver et suivre ses réservations ;
- propriétaire : publier et gérer ses bateaux, suivre les demandes, transmettre des documents ;
- administrateur : modérer utilisateurs, bateaux, réservations, avis, documents, paiements et signalements.

Fonctionnalités principales : accueil, catalogue, filtres, fiches bateaux, réservation, authentification JWT, réinitialisation du mot de passe, tableaux de bord propriétaire et administrateur, modération, envoi de fichiers contrôlé, Swagger, i18n FR/DE/EN/IT/RU/AR avec RTL arabe.

## 2. Audit UX

Points positifs :

- navigation principale claire ;
- parcours locataire cohérent : accueil -> recherche -> fiche -> réservation ;
- espaces owner/admin séparés et protégés ;
- dropdown langue compact avec langue active ;
- états loading/empty/errors présents sur les zones critiques.

Points de friction :

- compte propriétaire actif immédiatement ; la validation admin concerne surtout bateaux/documents/avis ;
- paiement simulé à annoncer comme limite du MVP ;
- SMTP nécessaire pour rendre la réinitialisation du mot de passe réelle en production ;
- tableaux admin/propriétaire à vérifier manuellement sur mobile.

## 3. Audit UI

La charte est cohérente : bleu marine, cyan, blanc, fonds clairs, titres Playfair Display et interface Outfit. Les cartes bateaux, badges, icônes Lucide et images locales par catégorie donnent un rendu présentable.

Corrections déjà appliquées :

- rythme vertical de la page d'accueil compact ;
- dropdown langue moderne ;
- images bateaux par catégorie ;
- correction SEO de base pendant cet audit : meta description correctement encodée, Open Graph, robots et sitemap production.

## 4. Audit responsive

Points de rupture à valider : 320, 360, 390, 414, 768, 1024, 1366 et 1440 px.

Zones critiques :

- navbar + burger + dropdown langue ;
- hero avec image ronde ;
- catalogue et cartes bateaux ;
- fiche bateau ;
- pages auth ;
- dashboards owner/admin ;
- footer.

État actuel : responsive implémenté, `overflow-x` limité, menu mobile compact, paddings homepage réduits. Vérification visuelle finale encore recommandée sur Render.

## 5. Audit fonctionnel

| Fonction | État | Commentaire |
| --- | --- | --- |
| Inscription locataire | Implémenté | À tester sur Render |
| Inscription propriétaire | Implémenté | Actif immédiatement |
| Connexion locataire, propriétaire, administrateur | Implémenté | À tester avec les comptes de recette |
| Déconnexion | Implémenté | À tester |
| Mot de passe oublié | Implémenté | Nécessite SMTP |
| Recherche bateaux | Implémenté | API + front |
| Filtres type/budget/skipper | Implémenté | À tester sur le catalogue |
| Fiche bateau | Implémenté | À tester avec slug ou identifiant |
| Réservation | Implémenté | Paiement simulé |
| Tableau de bord propriétaire | Implémenté | Routes protégées |
| Tableau de bord administrateur | Implémenté | Routes protégées |
| Modération bateaux | Implémenté | Admin |
| Modération avis/documents | Implémenté | Admin |
| Contact | Implémenté | À tester |

## 6. Audit technique

Stack : React/Vite, React Router, i18next, Node/Express, MongoDB/Mongoose, JWT, bcrypt, Helmet, CORS, rate-limit, Multer, Swagger, Playwright, Supertest, k6.

Points positifs :

- HTTPS via Render ;
- `/api/health` disponible ;
- `/api-docs` disponible ;
- Helmet actif ;
- limiteur de requêtes appliqué sur `/api` ;
- envoi de fichiers limité par type MIME et taille ;
- build monorepo configuré pour servir le frontend depuis Express.

Limites :

- upload local non persistant sur Render gratuit ;
- SMTP obligatoire pour une vraie réinitialisation du mot de passe ;
- paiement réel non branché ;
- surveillance et journalisation avancées limitées à la documentation et aux logs Render.

## 7. Audit SEO

Points présents :

- composant `SEO` ;
- `robots.txt` ;
- `sitemap.xml` ;
- URLs publiques propres ;
- alt images bateaux via titre dynamique.

Corrections appliquées pendant l'audit :

- `robots.txt` pointe maintenant vers `https://dsp-dev-o24a-g6-fr.onrender.com/sitemap.xml` ;
- `sitemap.xml` pointe maintenant vers l'URL Render et inclut pages publiques utiles ;
- `client/index.html` corrige la meta description mal encodée ;
- ajout de `theme-color`, Open Graph et Twitter card.

Recommandations :

- ajouter canonical URLs ;
- enrichir JSON-LD Organization/WebSite ;
- générer un sitemap dynamique des fiches bateaux en vraie production.

## 8. Audit accessibilité

Points positifs :

- focus visible global ;
- labels présents sur formulaires principaux ;
- images bateaux avec alt ;
- dropdown langue avec `aria-haspopup`, `aria-expanded`, options boutons, Escape et clic extérieur ;
- menu burger avec `aria-expanded`.

Tests à faire avec WAVE :

- accueil ;
- catalogue ;
- login ;
- fiche bateau ;
- dashboard admin si possible.

## 9. Audit sécurité

Points positifs :

- mots de passe hachés avec bcrypt ;
- JWT sur routes privées ;
- contrôles de rôle owner/admin ;
- comptes désactivés bloqués par `isActive` ;
- jeton de réinitialisation haché, avec expiration ;
- Helmet, CORS et rate-limit actifs ;
- envoi de fichiers limité par type MIME et taille ;
- `.env` attendu hors dépôt.

Risques / limites :

- CSRF à documenter selon le stockage exact du JWT côté front ;
- stockage local des fichiers à remplacer par Cloudinary/S3 en production ;
- SMTP et secrets Render à surveiller ;
- validation admin des comptes propriétaires absente si exigée par le cahier des charges.

## 10. Audit performances

Commandes locales à exécuter :

```bash
npm --prefix client run build
npm --prefix client run lint
npm --prefix server test
npm --prefix client run test:e2e
```

Outils externes attendus :

- Lighthouse ;
- PageSpeed Insights ;
- WAVE ;
- GTmetrix.

Résultats Lighthouse 12.8.2 (site construit en mode production, sur la machine de test ; détails dans
`docs/LIGHTHOUSE_ACCESSIBILITY.md` et rapports dans `docs/reports/lighthouse/`) :

| Page | Mode | Performance | SEO | Accessibilité | Bonnes pratiques |
| --- | --- | ---: | ---: | ---: | ---: |
| Accueil (08/10/2026) | Mobile | 78 | 100 | 100 | 96 |
| Accueil (14/10/2026) | Ordinateur | 99 | 100 | 100 | 96 |
| Catalogue (14/10/2026) | Ordinateur | 94 | 100 | 100 | 96 |

PageSpeed Insights et WAVE restent à lancer sur le site en ligne (Render).

## 11. Analyse concurrentielle

| Critère | SailingLoc | Click&Boat | SamBoat | Nautal |
| --- | --- | --- | --- | --- |
| Positionnement | MVP P2P | Marketplace mature | Marketplace mature | Marketplace nautique |
| Recherche | Destination, type, budget, skipper | Filtres avancés, carte | Filtres avancés, carte | Recherche + filtres |
| Réservation | Flow MVP | Paiement réel, garanties | Paiement réel, garanties | Paiement réel |
| Confiance | Validation bateaux/documents/avis | Avis, assurances, vérification | Avis, assurances | Avis, garanties |
| Design | Propre, soutenance | Optimisé pour la conversion | Commercial | Marketplace classique |
| Écart principal | Paiement/SMTP/uploads prod | Produit complet | Produit complet | Produit complet |

## 12. Tableau des anomalies et recommandations

| ID | Catégorie | Anomalie | Priorité | Statut |
| --- | --- | --- | --- | --- |
| A01 | SEO | Sitemap/robots pointaient vers localhost | Haute | Corrigé |
| A02 | SEO | Meta description HTML mal encodée | Haute | Corrigé |
| A03 | SEO | Open Graph absent | Moyenne | Corrigé (base) |
| A04 | Performance | Rapports Lighthouse/PageSpeed non archivés | Haute | Lighthouse archivé (octobre 2026) ; PageSpeed à faire |
| A05 | Accessibilité | Rapport WAVE non archivé | Haute | À faire |
| A06 | Fonctionnel | SMTP non garanti en production | Haute | Configurer Render |
| A07 | UX | Propriétaire actif sans validation admin compte | Moyenne | À arbitrer |
| A08 | Technique | Upload local non persistant Render | Moyenne | Prévoir stockage objet |
| A09 | UI | Tableaux admin à vérifier sur mobile | Moyenne | Recette manuelle |
| A10 | SEO | Sitemap non dynamique pour bateaux | Faible | Vraie prod |

## 13. Livrables attendus

- captures d'écran des anomalies : `docs/reports/screenshots/` ;
- rapports Lighthouse HTML/PDF : `docs/reports/` ;
- rapport PageSpeed : export PDF ou captures ;
- rapport WAVE : captures ;
- tableau des anomalies : présent ci-dessus ;
- priorisation : Haute / Moyenne / Faible ;
- conclusion : ci-dessous.

## Conclusion générale

SailingLoc est présentable comme MVP full-stack de fin d'année : les rôles, l'API, les dashboards, la modération, l'i18n, les bases SEO, la sécurité minimale et la documentation technique sont en place. Les corrections de cet audit améliorent la cohérence SEO de la version en ligne. Les limites à assumer clairement sont le SMTP réel, le paiement réel, le stockage persistant des fichiers, les rapports PageSpeed et WAVE à archiver et éventuelle validation admin des comptes propriétaires si le cahier des charges l'exige.
