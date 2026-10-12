# Recette finale - SailingLoc

Document de contrôle avant rendu du projet de fin d'année.

## Informations de rendu

| Element | Valeur |
| --- | --- |
| URL publique | https://dsp-dev-o24a-g6-fr.onrender.com/ |
| Swagger API | https://dsp-dev-o24a-g6-fr.onrender.com/api-docs |
| Repository | https://github.com/zerkor/sailingloc |
| Branche | main |
| Nature du projet | Projet étudiant fictif, aucune réservation ou transaction réelle |

## Comptes de démonstration

| Rôle | Email | Mot de passe | Parcours principal |
| --- | --- | --- | --- |
| Admin | admin@sailingloc.fr | Admin123! | Back-office, modération, emails, logs |
| Propriétaire | owner1@sailingloc.fr | Owner123! | Dashboard, annonces, réservations, documents |
| Locataire | tenant1@sailingloc.fr | Tenant123! | Recherche, réservation, paiement simule, avis |

## Recette fonctionnelle prioritaire

| Test | Statut attendu | Preuve a garder |
| --- | --- | --- |
| Accueil responsive desktop/mobile | Conforme | Capture 390px + desktop |
| Catalogue bateaux + filtres | Conforme | Capture avec filtres actifs |
| Fiche bateau | Conforme | Capture image, prix, réservation |
| Inscription locataire | Conforme | Capture compte + email reçu |
| Inscription propriétaire | Conforme | Capture dashboard owner |
| Connexion admin | Conforme | Capture dashboard admin |
| Création réservation locataire | Conforme | Capture mes réservations |
| Acceptation réservation owner/admin | Conforme | Capture statut + email reçu |
| Paiement simule + facture PDF | Conforme | Capture bouton facture + email avec PDF |
| Contact public | Conforme | Capture message admin + email |
| Newsletter admin | Conforme | Capture formulaire + email reçu |
| Mot de passe oublie | Conforme si Brevo actif | Capture email reset |
| Mentions légales | Conforme | Capture mention projet fictif |

## Recette technique

| Contrôle | Commande / URL | Statut |
| --- | --- | --- |
| Build production | `npm run build` | Valide le 05/08/2026 |
| Tests API | `npm --prefix server test` | Valide le 06/08/2026 : 22/22, facture PDF incluse |
| Tests E2E | `npm --prefix client run test:e2e` | Valide le 05/08/2026 : 8/8 |
| Healthcheck | `/api/health` | Doit retourner OK |
| Swagger | `/api-docs` | Doit être accessible |
| k6 smoke | `k6 run load-tests/k6/sailingloc-smoke.js` | Résultat a coller dans docs/TEST_CHARGE.md |
| Lighthouse mobile | Chrome DevTools | Rapport a exporter |
| Lighthouse desktop | Chrome DevTools | Rapport a exporter |

## Limites MVP a annoncer

- Paiement simule, aucun encaissement réel.
- Upload local, stockage cloud nécessaire en vraie production.
- Pas de contrat PDF ni signature électronique.
- Pas de messagerie interne locataire/propriétaire.
- Signalements présents, mais workflow de litige complet hors MVP.
- Monitoring limite aux logs Render, healthcheck et documentation.
- Projet étudiant fictif : aucune réservation ou location réelle.

## Captures finales conseillées

1. Accueil desktop.
2. Accueil mobile.
3. Catalogue avec catégories et filtres.
4. Fiche bateau.
5. Dashboard propriétaire.
6. Dashboard administrateur.
7. Messages contact admin.
8. Page emails/newsletter admin.
9. Email Brevo reçu.
10. Facture PDF générée après paiement.
11. Mentions légales avec disclaimer fictif.

## Verdict

Le projet est présentable comme MVP académique complet si les preuves de recette sont ajoutées au dossier de rendu : captures, tests, Lighthouse et email Brevo.
