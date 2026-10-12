# Identifiants de recette - SailingLoc

Document a fournir avec le rendu de soutenance.

## URL du site

| Type | URL |
| --- | --- |
| Site public + API | `https://dsp-dev-o24a-g6-fr.onrender.com/` |
| Swagger API | `https://dsp-dev-o24a-g6-fr.onrender.com/api-docs` |
| Healthcheck API | `https://dsp-dev-o24a-g6-fr.onrender.com/api/health` |

## Comptes applicatifs de démonstration

Ces comptes sont créés par le seed de démonstration.

| Rôle | Email | Mot de passe | Accès principal |
| --- | --- | --- | --- |
| Administrateur | `admin@sailingloc.fr` | `Admin123!` | `/admin/dashboard` |
| Propriétaire | `owner1@sailingloc.fr` | `Owner123!` | `/owner/dashboard` |
| Locataire | `tenant1@sailingloc.fr` | `Tenant123!` | `/my-bookings` |

Comptes supplémentaires :

| Rôle | Emails | Mot de passe |
| --- | --- | --- |
| Propriétaires | `owner1@sailingloc.fr` a `owner14@sailingloc.fr` | `Owner123!` |
| Locataires | `tenant1@sailingloc.fr` a `tenant20@sailingloc.fr` | `Tenant123!` |

## Parcours de test conseilles

1. Connexion administrateur.
2. Consulter le dashboard admin.
3. Gérer utilisateurs, bateaux, avis, documents et paiements.
4. Connexion propriétaire.
5. Créer une annonce, consulter les réservations, uploader un document.
6. Connexion locataire.
7. Consulter les bateaux, demander une réservation, payer une réservation acceptée.
8. Tester mot de passe oublie si SMTP configure.

## Accès Git

| Element | Valeur |
| --- | --- |
| Repository | `https://github.com/zerkor/sailingloc` |
| Branche principale | `main` |

Ne pas fournir de mot de passe Git personnel dans le dossier de rendu. Fournir plutôt un accès GitHub invite ou un token limite si l'école l'exige.

## Gestion de projet

| Outil | URL |
| --- | --- |
| Trello | `https://trello.com/b/w9pMhsou/suivi-de-projet-sailingloc` |

Si un login est demande, créer un accès invite au tableau plutôt que partager un mot de passe personnel.

## Accès techniques utiles

| Outil | Usage |
| --- | --- |
| Render | Hébergement du service web |
| MongoDB Atlas / Compass | Vérification base de données |
| SMTP provider | Test reset password |

## Note sécurité

Les identifiants ci-dessus sont des comptes de démonstration. Ils ne doivent pas être réutilisés en production commerciale.
