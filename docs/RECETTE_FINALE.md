# Recette finale - SailingLoc

Document de contrôle avant rendu du projet de fin d'année.

## Informations de rendu

| Élément | Valeur |
| --- | --- |
| URL publique | https://dsp-dev-o24a-g6-fr.onrender.com/ |
| Swagger API | https://dsp-dev-o24a-g6-fr.onrender.com/api-docs |
| Dépôt | https://github.com/zerkor/sailingloc |
| Branches | dev, preprod et prod (version en ligne) ; main = code d'avant le rattrapage |
| Nature du projet | Projet étudiant fictif, aucune réservation ou transaction réelle |

## Comptes de démonstration

| Rôle | E-mail | Mot de passe | Parcours principal |
| --- | --- | --- | --- |
| Admin | admin@sailingloc.fr | Admin123! | Back-office, modération, e-mails, journaux |
| Propriétaire | owner1@sailingloc.fr | Owner123! | Dashboard, annonces, réservations, documents |
| Locataire | tenant1@sailingloc.fr | Tenant123! | Recherche, réservation, paiement simulé, avis |

## Recette fonctionnelle prioritaire

| Test | Statut attendu | Preuve à garder |
| --- | --- | --- |
| Accueil responsive desktop/mobile | Conforme | Capture 390px + desktop |
| Catalogue bateaux + filtres | Conforme | Capture avec filtres actifs |
| Fiche bateau | Conforme | Capture image, prix, réservation |
| Inscription locataire | Conforme | Capture du compte + e-mail reçu |
| Inscription propriétaire | Conforme | Capture dashboard owner |
| Connexion admin | Conforme | Capture dashboard admin |
| Création réservation locataire | Conforme | Capture mes réservations |
| Acceptation réservation owner/admin | Conforme | Capture du statut + e-mail reçu |
| Paiement simulé + facture PDF | Conforme | Capture du bouton facture + e-mail avec PDF |
| Contact public | Conforme | Capture du message admin + e-mail |
| Newsletter admin | Conforme | Capture du formulaire + e-mail reçu |
| Mot de passe oublié | Conforme si Brevo actif | Capture de l'e-mail de réinitialisation |
| Mentions légales | Conforme | Capture mention projet fictif |

## Recette technique

| Contrôle | Commande / URL | Statut |
| --- | --- | --- |
| Build production | `npm run build` | Validé le 05/08/2026 |
| Tests API | `npm --prefix server test` | Validé le 06/08/2026 : 22/22, facture PDF incluse ; 60/60 le 14/10/2026 (voir docs/reports) |
| Tests E2E | `npm --prefix client run test:e2e` | Validé le 05/08/2026 : 8/8 ; 13/13 sur Chromium le 14/10/2026 |
| Healthcheck | `/api/health` | Doit répondre OK |
| Swagger | `/api-docs` | Doit être accessible |
| k6 smoke | `k6 run load-tests/k6/sailingloc-smoke.js` | Résultats dans load-tests/results/2026-10-08-local |
| Lighthouse mobile | Chrome DevTools | Rapports dans docs/reports/lighthouse |
| Lighthouse ordinateur | Chrome DevTools | Rapports dans docs/reports/lighthouse |

## Limites du MVP à annoncer

- Paiement simulé, aucun encaissement réel.
- Upload local, stockage cloud nécessaire en vraie production.
- Pas de contrat PDF ni signature électronique.
- Pas de messagerie interne locataire/propriétaire.
- Signalements présents, mais workflow de litige complet hors MVP.
- Surveillance limitée aux journaux Render, healthcheck et documentation.
- Projet étudiant fictif : aucune réservation ou location réelle.

## Captures finales conseillées

1. Accueil desktop.
2. Accueil mobile.
3. Catalogue avec catégories et filtres.
4. Fiche bateau.
5. Dashboard propriétaire.
6. Dashboard administrateur.
7. Messages contact admin.
8. Page e-mails/newsletter de l'administrateur.
9. E-mail Brevo reçu.
10. Facture PDF générée après paiement.
11. Mentions légales avec la mention « projet fictif ».

## Verdict

Le projet est présentable comme MVP académique complet si les preuves de recette sont ajoutées au dossier de rendu : captures, tests, Lighthouse et e-mail Brevo.
