# Audit final soutenance - SailingLoc

## Synthèse

SailingLoc est un MVP full-stack avancé de location de bateaux entre particuliers. Le projet couvre les parcours principaux du cahier des charges : consultation catalogue, inscription, authentification, rôles, création d'annonces, réservation, paiement simulé, avis, documents propriétaire, newsletter client et back-office administrateur.

Le projet est présentable en soutenance comme MVP académique déployé. Les limites restantes doivent être assumées clairement : paiement réel, stockage cloud, audit sécurité externe, monitoring complet et tests de charge à grande échelle.

## Couverture fonctionnelle

| Domaine | Statut | Commentaire |
| --- | --- | --- |
| Catalogue public | Réalisé | Liste, filtres, fiches détail, images par catégorie |
| Navigation UX | Réalisé | Header responsive, fil d'Ariane public, pages légales accessibles |
| Authentification | Réalisé | JWT, rôles, protection routes |
| Mot de passe oublié | Réalisé | Jeton haché, expiration, e-mail Brevo API/SMTP |
| Locataire | Réalisé | Réservation, historique, paiement simulé |
| Facture | Réalisé MVP | Génération PDF après paiement simulé, envoi par e-mail et lien espace locataire |
| Propriétaire | Réalisé | Dashboard, annonces, réservations, documents |
| Administrateur | Réalisé | Utilisateurs, bateaux, réservations, avis, documents, paiements, signalements, contact, e-mails, journaux |
| Newsletter | Réalisé | Envoi Brevo depuis le back-office aux locataires actifs |
| Contact | Réalisé | Formulaire public, notification par e-mail et traitement back-office |
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
| Base de données | Réalisé | MongoDB, schémas principaux |
| API docs | Réalisé | Swagger disponible |
| Docker | Réalisé | Dockerfiles + docker-compose |
| CI | Réalisé | GitHub Actions lint/test/build/e2e |
| Tests API | Réalisé | Supertest + MongoMemoryServer, vérification facture PDF |
| Tests admin | Réalisé | Routes critiques admin |
| E2E | Partiel | Tests Playwright validés (13/13 sur Chromium le 14/10/2026), couverture non exhaustive |
| Load testing | Mis en place | Script k6 dans `load-tests/k6` |
| Monitoring | Documenté | Morgan + healthcheck, pas Sentry/Grafana réel |
| Sauvegarde | Documenté | Scripts et stratégie, pas d'automatisation dans le cloud |
| Upload production | Partiel | Local uniquement |
| Email production | Réalisé | Brevo API configurée via variables Render |
| SEO et légal | Réalisé | Sitemap, robots, GTM, mentions projet étudiant fictif |

## Écarts importants au cahier des charges

1. Paiement sécurisé réel non connecté.
2. Stockage fichiers non persistant/cloud.
3. Pas de contrat de location généré automatiquement.
4. Pas de workflow complet de litige.
5. Pas de messagerie interne.
6. Test de charge : rapport chiffré commité le 08/10/2026 (`load-tests/results/2026-10-08-local`).
7. Rapports Lighthouse commités le 12/10/2026 (`docs/reports/lighthouse`) ; audit Axe manuel encore à faire.
8. Jeton JWT stocké côté client en `localStorage`, acceptable pour un MVP mais moins robuste qu'un cookie HttpOnly.
9. Surveillance de la production limitée au healthcheck et aux journaux HTTP.
10. RGPD présent mais incomplet pour une production commerciale.

## Risques de soutenance

| Risque | Réponse conseillée |
| --- | --- |
| "Le paiement est-il réel ?" | Non, il est simulé. Le modèle et le workflow sont prêts pour Stripe. |
| "Les fichiers restent-ils après redéploiement Render ?" | Non : sur Render, les fichiers envoyés sont effacés à chaque redéploiement. En vraie production, il faut S3 ou Cloudinary. |
| "SMTP marche-t-il vraiment ?" | Oui via Brevo API si les variables Render sont présentes ; garder une capture de l'e-mail reçu. |
| "Peut-on vraiment réserver ?" | Non commercialement : le site est un projet étudiant fictif, les réservations sont des données de démonstration. |
| "Le RGPD est-il complet ?" | Les bases sont présentes : consentement, cookies, export, anonymisation. Production = audit juridique. |
| "Les performances sont-elles prouvées ?" | Oui : tests k6 du 08/10/2026 (load-tests/results) et rapports Lighthouse (docs/reports/lighthouse). |

## Priorités finales avant rendu

1. Build de production validé le 05/08/2026 avec `npm run build`.
2. Tests API validés le 06/08/2026 : 22/22 avec `npm --prefix server test`.
3. Tests E2E validés le 05/08/2026 : 8/8 avec `npm --prefix client run test:e2e`.
4. Tester `/forgot-password`, l'e-mail de création de compte, contact et newsletter Brevo.
5. Tests k6 lancés le 08/10/2026 (résultats dans `load-tests/results/2026-10-08-local`).
6. Rapports Lighthouse mobile et ordinateur conservés dans `docs/reports/lighthouse`.
7. Vérifier les trois comptes de recette sur Render.
8. Faire 6 captures propres : accueil, catalogue, fiche bateau, tableau de bord propriétaire, tableau de bord administrateur, e-mail/newsletter.

## Conclusion

Le projet est solide pour un rendu de fin d'année si le discours reste honnête : MVP complet, déployé, documenté et testable, avec limites de production clairement identifiées.
