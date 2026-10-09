# Rapport k6 SailingLoc - Demo oral

Rapport genere le : 2026-10-08T16:50:27.529Z

Date du test : 10/08/2026 vers 20 h 55 (heure de Paris), sur Render, avant le correctif du limiteur de requetes

## Objectif

Verifier que les pages publiques et endpoints critiques restent accessibles sous une charge moderee compatible avec Render gratuit.

## Resultats

| Indicateur | Valeur |
| --- | ---: |
| Requetes HTTP | 1155 |
| Duree moyenne | 294 ms |
| P95 global | 844 ms |
| Taux erreurs HTTP | 49.35% |
| Checks reussis | 55.64% |

## Conclusion

A surveiller: limites atteintes sur hebergement gratuit.

## Lecture soutenance

Ce test ne valide pas 10 000 utilisateurs pendant 24h. Il valide un parcours public realistement testable sur une infrastructure gratuite. Les tests lourds doivent etre executes sur une infrastructure dediee avec quotas reseau et base de donnees adaptes.
