# Tests de montée en charge - SailingLoc

## Objectif

Valider que le MVP SailingLoc reste stable sur les parcours publics les plus consultés :

- page d'accueil ;
- catalogue bateaux ;
- healthcheck API ;
- endpoint API catalogue.

Le test ne remplace pas un audit de performance en production. Il fournit une preuve de soutenance sur la stabilité du service déployé.

## Outil retenu

`k6`, car il est simple à installer, programmable en JavaScript et adapté aux tests HTTP.

## Installation

Windows :

```powershell
winget install k6.k6
```

macOS :

```bash
brew install k6
```

## Exécution

Depuis la racine du projet :

```bash
k6 run load-tests/k6/sailingloc-smoke.js
```

Pour tester une autre URL :

```bash
k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com load-tests/k6/sailingloc-smoke.js
```

## Scénario

Le scénario `progressive_load` simule :

| Phase | Durée | Utilisateurs virtuels |
| --- | ---: | ---: |
| Montée initiale | 30 s | 5 |
| Charge modérée | 1 min | 15 |
| Charge soutenue MVP | 1 min | 30 |
| Descente | 30 s | 0 |

## Seuils acceptés

| Indicateur | Seuil |
| --- | --- |
| Taux d'erreur HTTP | < 5 % |
| p95 temps de réponse | < 1200 ms |
| Checks fonctionnels | > 95 % |

## Résultats

Campagne du 08/10/2026 (7 tests k6, machine de test) : voir `load-tests/results/2026-10-08-local/README.md`.
Le scénario progressif ci-dessus (test C) a donné 0 % d'erreur sur 4 888 requêtes. Le rapport complet, avec
l'analyse des 49 % d'erreurs du test d'août sur Render (refus du limiteur de requêtes, corrigé), est dans le
livrable 15.

## Interprétation pour la soutenance

Si les seuils passent, formuler ainsi :

> Le MVP supporte une charge progressive modérée sur les pages publiques et endpoints principaux. Les tests montrent une stabilité suffisante pour une démonstration et une première mise en ligne. Une campagne plus large serait nécessaire avant une production commerciale.

Si les seuils échouent :

> Les résultats montrent une limite de performance à corriger avant production. Les pistes principales sont l'optimisation MongoDB, le cache, la compression des ressources, le dimensionnement Render et le stockage cloud pour les fichiers.
