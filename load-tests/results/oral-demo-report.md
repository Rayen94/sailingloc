# Rapport k6 SailingLoc - Démonstration de l'oral

Rapport généré le : 2026-10-08T16:50:27.529Z

Date du test : 10/08/2026 vers 20 h 55 (heure de Paris), sur Render, avant le correctif du limiteur de requêtes

## Objectif

Vérifier que les pages publiques et les points d'accès critiques de l'API restent accessibles sous une charge modérée, compatible avec l'offre gratuite de Render.

## Résultats

| Indicateur | Valeur |
| --- | ---: |
| Requêtes HTTP | 1155 |
| Durée moyenne | 294 ms |
| p95 global | 844 ms |
| Taux d'erreurs HTTP | 49,35 % |
| Contrôles réussis | 55,64 % |

## Conclusion

À surveiller : limites atteintes sur l'hébergement gratuit.

## Lecture pour la soutenance

Ce test ne valide pas 10 000 utilisateurs pendant 24 h. Il valide un parcours public qu'il est réaliste de tester sur une infrastructure gratuite. Les tests lourds doivent être exécutés sur une infrastructure dédiée, avec des quotas réseau et une base de données adaptés.
