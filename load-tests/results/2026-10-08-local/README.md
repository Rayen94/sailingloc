# Campagne de tests de charge du 08/10/2026 (machine locale)

Conditions : machine Linux 2 cœurs (Intel Xeon 2,8 GHz), 8 Go de mémoire ; serveur SailingLoc en mode
production (Node.js 22) ; base FerretDB 1.24 compatible MongoDB, remplie avec le script de démonstration
(37 bateaux, 60 réservations) ; k6 1.3.0 lancé sur la même machine. Ce ne sont pas les conditions de
Render (offre gratuite) : les temps absolus sont meilleurs ici, ce qui compte est la comparaison.

| Fichier | Scénario | Utilisateurs virtuels | Requêtes | Erreurs | p95 |
| --- | --- | ---: | ---: | ---: | ---: |
| A_avant_correctif | oral-demo.js, code du 10/08 (avant correctif) | 8 pendant 90 s | 2 160 | 57,5 % (429) | 4 ms |
| B_apres_correctif | oral-demo.js, code corrigé | 8 pendant 90 s | 2 160 | 0 % | 4 ms |
| C_montee_progressive | k6/sailingloc-smoke.js | 5 → 15 → 30 | 4 888 | 0 % | 3 ms |
| D_charge_constante | constant-load.js | 20 pendant 2 min | 4 772 | 0 % | 5 ms |
| E_pic | spike-test.js (0 → 200 en 10 s) | 200 | 14 078 | 0 % | 4 ms |
| F_seuil_critique | search-journey.js (cache sans limite) | 10 → 200 | 15 384 | 0 % | 2 572 ms |
| G_seuil_apres_cache | search-journey.js (cache limité) | 10 → 200 | 14 777 | 0 % | 2 744 ms |

Les fichiers `*_par_15s.json` donnent, toutes les 15 secondes : utilisateurs, requêtes par seconde,
médiane, p95, erreurs, CPU du serveur Node, CPU de la base et mémoire du serveur.

Point de saturation (F et G) : vers 75 à 85 utilisateurs virtuels, environ 80 requêtes par seconde ;
au-delà, le p95 dépasse 1 200 ms. La base de données (environ 150 % de CPU sur 2 cœurs) est le goulot
d'étranglement ; le serveur Node reste vers 25 %.
