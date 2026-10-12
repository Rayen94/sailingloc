# Audit final soutenance - SailingLoc

## Synthèse

SailingLoc est un MVP full-stack avance de location de bateaux entre particuliers. Le projet couvre les parcours principaux du cahier des charges : consultation catalogue, inscription, authentification, rôles, création d'annonces, réservation, paiement simule, avis, documents propriétaire, newsletter client et back-office administrateur.

Le projet est présentable en soutenance comme MVP académique déployé. Les limites restantes doivent être assumées clairement : paiement réel, stockage cloud, audit sécurité externe, monitoring complet et tests de charge a grande échelle.

## Couverture fonctionnelle

| Domaine | Statut | Commentaire |
| --- | --- | --- |
| Catalogue public | Réalisé | Liste, filtres, fiches détail, images par catégorie |
| Navigation UX | Réalisé | Header responsive, fil d'Ariane public, pages légales accessibles |
| Authentification | Réalisé | JWT, rôles, protection routes |
| Mot de passe oublie | Réalisé | Token hashe, expiration, email Brevo API/SMTP |
| Locataire | Réalisé | Réservation, historique, paiement simule |
| Facture | Réalisé MVP | Génération PDF après paiement simule, envoi email et lien espace locataire |
| Propriétaire | Réalisé | Dashboard, annonces, réservations, documents |
| Administrateur | Réalisé | Users, bateaux, bookings, avis, documents, paiements, reports, contact, emails, logs |
| Newsletter | Réalisé | Envoi Brevo depuis le back-office aux locataires actifs |
| Contact | Réalisé | Formulaire public, notification email et traitement back-office |
| Avis | Réalisé | Dépôt après réservation terminée, modération admin |
| Documents | Réalisé MVP | Upload local, validation admin |
| Paiement | Partiel | Simulation type Stripe, facture PDF, pas d'encaissement réel |
| Notifications | Partiel | Notifications backend, expérience front limitée |
| Litiges | Partiel | Signalements présents, workflow d'arbitrage incomplet |
| Contrats | Non réalisé | Pas de génération PDF ni signature |
| Messagerie | Non réalisé | Hors MVP actuel |
| Application mobile native | Non réalisé | Responsive web uniquement |

## Couverture technique

| Domaine | Statut | Commentaire |
| --- | --- | --- |
| Frontend | Réalisé | React, Vite, Tailwind, responsive |
| Backend | Réalisé | Express, Mongoose, architecture controllers/routes/models |
| Base de données | Réalisé | MongoDB, schemas principaux |
| API docs | Réalisé | Swagger disponible |
| Docker | Réalisé | Dockerfiles + docker-compose |
| CI | Réalisé | GitHub Actions lint/test/build/e2e |
| Tests API | Réalisé | Supertest + MongoMemoryServer, vérification facture PDF |
| Tests admin | Réalisé | Routes critiques admin |
| E2E | Partiel | Smoke tests Playwright valides, pas couverture exhaustive |
| Load testing | Mis en place | Script k6 dans `load-tests/k6` |
| Monitoring | Documente | Morgan + healthcheck, pas Sentry/Grafana réel |
| Backup | Documente | Scripts et stratégie, pas automatisation cloud |
| Upload production | Partiel | Local uniquement |
| Email production | Réalisé | Brevo API configurée via variables Render |
| SEO legal | Réalisé | Sitemap, robots, GTM, mentions projet étudiant fictif |

## Écarts importants au cahier des charges

1. Paiement sécurisé réel non connecte.
2. Stockage fichiers non persistant/cloud.
3. Pas de contrat de location généré automatiquement.
4. Pas de workflow complet de litige.
5. Pas de messagerie interne.
6. Test de charge : rapport chiffré commité le 08/10/2026 (`load-tests/results/2026-10-08-local`).
7. Rapports Lighthouse commités le 12/10/2026 (`docs/reports/lighthouse`) ; audit Axe manuel encore à faire.
8. Auth JWT stockée cote client en `localStorage`, acceptable MVP mais moins robuste qu'un cookie HttpOnly.
9. Monitoring production limite au healthcheck et logs HTTP.
10. RGPD présent mais incomplet pour une production commerciale.

## Risques de soutenance

| Risque | Réponse conseillée |
| --- | --- |
| "Le paiement est-il réel ?" | Non, il est simule. Le modèle et le workflow sont prêts pour Stripe. |
| "Les fichiers restent-ils après redéploiement Render ?" | En MVP oui localement, en vraie prod il faut S3/Cloudinary. |
| "SMTP marche-t-il vraiment ?" | Oui via Brevo API si les variables Render sont présentes ; garder une capture de l'email reçu. |
| "Peut-on vraiment réserver ?" | Non commercialement : le site est un projet étudiant fictif, les réservations sont des données de démonstration. |
| "Le RGPD est-il complet ?" | Les bases sont présentes : consentement, cookies, export, anonymisation. Production = audit juridique. |
| "Les performances sont-elles prouvées ?" | Script k6 et procédure Lighthouse fournis ; résultats a générer avant rendu final. |

## Priorités finales avant rendu

1. Build production valide le 05/08/2026 avec `npm run build`.
2. Tests API valides le 06/08/2026 : 22/22 avec `npm --prefix server test`.
3. Tests E2E valides le 05/08/2026 : 8/8 avec `npm --prefix client run test:e2e`.
4. Tester `/forgot-password`, email de création de compte, contact et newsletter Brevo.
5. Lancer le test k6 et coller les résultats dans `docs/TEST_CHARGE.md`.
6. Générer Lighthouse mobile/desktop et conserver les rapports dans `docs/reports/`.
7. Vérifier les trois comptes de recette sur Render.
8. Faire 6 captures propres : accueil, catalogue, fiche bateau, owner dashboard, admin dashboard, email/newsletter.

## Conclusion

Le projet est solide pour un rendu de fin d'année si le discours reste honnête : MVP complet, déployé, documente et testable, avec limites de production clairement identifiées.
