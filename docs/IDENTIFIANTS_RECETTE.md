# Identifiants de recette - SailingLoc

Document à fournir avec le rendu de soutenance.

## URL du site

| Type | URL |
| --- | --- |
| Site public + API | `https://dsp-dev-o24a-g6-fr.onrender.com/` |
| Documentation de l'API (Swagger) | `https://dsp-dev-o24a-g6-fr.onrender.com/api-docs` |
| État de l'API | `https://dsp-dev-o24a-g6-fr.onrender.com/api/health` |

## Comptes de démonstration

Ces comptes sont créés par le script de démonstration (`npm run seed`), en local. En production, les
données de démonstration sont désactivées par défaut (voir le README).

| Rôle | E-mail | Mot de passe | Accès principal |
| --- | --- | --- | --- |
| Administrateur | `admin@sailingloc.fr` | `Admin123!` | `/admin/dashboard` |
| Propriétaire | `owner1@sailingloc.fr` | `Owner123!` | `/owner/dashboard` |
| Locataire | `tenant1@sailingloc.fr` | `Tenant123!` | `/my-bookings` |

Comptes supplémentaires :

| Rôle | E-mails | Mot de passe |
| --- | --- | --- |
| Propriétaires | `owner1@sailingloc.fr` à `owner20@sailingloc.fr` | `Owner123!` |
| Locataires | `tenant1@sailingloc.fr` à `tenant30@sailingloc.fr` | `Tenant123!` |

## Parcours de test conseillés

1. Connexion administrateur.
2. Consulter le tableau de bord de l'administrateur.
3. Gérer les utilisateurs, les bateaux, les avis, les documents et les paiements.
4. Connexion propriétaire.
5. Créer une annonce, consulter les réservations, envoyer un document.
6. Connexion locataire.
7. Consulter les bateaux, demander une réservation, payer une réservation acceptée.
8. Tester « Mot de passe oublié » si l'envoi d'e-mails (SMTP) est configuré.

## Accès Git

| Élément | Valeur |
| --- | --- |
| Dépôt d'origine | `https://github.com/zerkor/sailingloc` |
| Branches | `dev`, `preprod`, `prod` (version en ligne) ; `main` = ancien code d'avant le rattrapage |
| Versions | étiquettes `v1.1` et `v1.2` |

Ne pas fournir de mot de passe Git personnel dans le dossier de rendu. Fournir plutôt un accès GitHub en tant
qu'invité, ou un jeton d'accès limité si l'école l'exige.

## Gestion de projet

| Outil | URL |
| --- | --- |
| Trello | `https://trello.com/b/w9pMhsou/suivi-de-projet-sailingloc` |

Si une connexion est demandée, inviter la personne sur le tableau plutôt que de partager un mot de passe
personnel.

## Accès techniques utiles

| Outil | Usage |
| --- | --- |
| Render | Hébergement du service web |
| MongoDB Atlas / Compass | Vérification de la base de données |
| Fournisseur SMTP (Brevo) | Test de la réinitialisation du mot de passe |

## Note de sécurité

Les identifiants ci-dessus sont des comptes de démonstration. Ils ne doivent jamais être réutilisés en
production commerciale.
