# Architecture SailingLoc

## Vue d'ensemble

SailingLoc est une plateforme MVP de location de bateaux entre particuliers. Elle couvre les rôles visiteur, locataire, propriétaire et administrateur.

## Stack

- Frontend : React, Vite, Tailwind, Axios, React Router.
- Backend : Node.js, Express, JWT, Mongoose.
- Base de données : MongoDB (Mongoose).
- Tests : Node test runner, Supertest, Vitest, Playwright.
- Documentation API : Swagger/OpenAPI.

## Structure

- `client/src` : application React.
- `server/src/controllers` : logique métier API.
- `server/src/routes` : routes Express.
- `server/src/models` : modèles Mongoose.
- `server/tests` : tests API.
- `docs` : documentation architecture, production, backup, monitoring.

## Schéma BDD

```mermaid
erDiagram
  User ||--o{ Boat : owns
  User ||--o{ Booking : rents
  Boat ||--o{ Booking : receives
  Boat ||--o{ Review : has
  Booking ||--o| Payment : generates
  User ||--o{ OwnerDocument : submits
  Boat ||--o{ OwnerDocument : verifies
  User ||--o{ Report : creates
  User ||--o{ AdminActionLog : performs
```

## Flux API

```mermaid
flowchart LR
  Client["React client"] --> API["Express API"]
  API --> Controller["Controller"]
  Controller --> Model["Mongoose model"]
  Model --> MongoDB["MongoDB"]
```

## Rôles

```mermaid
flowchart TD
  Visitor["Visiteur"] -->|"Consulte les bateaux"| Public["Catalogue public"]
  Tenant["Locataire"] -->|"Réserve et paie en simulation"| Booking["Réservations"]
  Owner["Propriétaire"] -->|"Publie bateaux et documents"| Boats["Annonces"]
  Admin["Admin"] -->|"Modère, rembourse, valide"| Backoffice["Back-office"]
```

## Workflow réservation

```mermaid
stateDiagram-v2
  [*] --> pending
  pending --> accepted
  pending --> rejected
  accepted --> confirmed
  confirmed --> completed
  pending --> cancelled
  accepted --> cancelled
```

## Workflow upload

```mermaid
flowchart LR
  Owner["Propriétaire"] --> UploadAPI["Upload API"]
  UploadAPI --> Multer["Multer"]
  Multer --> Folder["server/uploads"]
  Folder --> URL["URL /uploads/..."]
  URL --> DB["URL stockée en base"]
```

## Paiement

Le paiement est simulé via un modèle `Payment` et un provider `simulated-stripe`. Les statuts sont cohérents avec les réservations, mais aucun prestataire de paiement réel n'est connecté (le code Stripe Checkout existe, désactivé par défaut).

## Modération admin

L'administrateur peut valider ou rejeter bateaux, avis et documents, gérer les utilisateurs, consulter les paiements et suivre les actions dans `AdminActionLog`.

## Sécurité

JWT, rôles serveur, rate limiting, Helmet, validation express-validator, filtrage upload par type MIME et taille.

## Limites MVP

Paiement simulé, e-mails actifs seulement si Brevo est configuré, fichiers stockés localement, vérification documentaire manuelle, pas de messagerie en temps réel, pas d'audit de sécurité complet.

## Améliorations futures

Stripe réel, stockage cloud, SMTP/reset password réel, messagerie, assurance partenaire, CI de déploiement, monitoring complet.
