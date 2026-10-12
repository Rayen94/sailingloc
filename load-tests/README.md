# SailingLoc Load Testing

Ces scripts k6 fournissent des scénarios réalistes pour un MVP académique. Ils ne contiennent pas de résultats fictifs.

## Installation

```powershell
winget install Grafana.k6
```

## Test recommande pour l'oral

Profil stable pour Render gratuit :

```powershell
# depuis le dossier du projet
$env:BASE_URL="https://dsp-dev-o24a-g6-fr.onrender.com"
$env:VUS="8"
$env:DURATION="90s"
npm run load:oral
```

Sorties générées :

- `load-tests/results/oral-demo.json` : résumé k6 brut.
- `load-tests/results/oral-demo-report.md` : rapport lisible pour la soutenance.

Ce profil teste un parcours public simple : accueil, catalogue bateaux API et healthcheck. Les seuils sont volontairement adaptes a Render gratuit pour présenter un résultat honnête et exploitable.

## Comparaison avant / après

```powershell
$env:BASE_URL="https://dsp-dev-o24a-g6-fr.onrender.com"
$env:VUS="20"
$env:DURATION="2m"
npm run load:compare
```

La commande compare l'ancien smoke test progressif et le test constant-load optimise, puis généré des JSON dans `load-tests/results`.

## Autres commandes

```powershell
k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com load-tests/constant-load.js
k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com load-tests/spike-test.js
k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com load-tests/stress-test.js
k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com load-tests/api-bookings.js
k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com load-tests/api-payments.js
# Parcours de recherche avec filtres variés (sollicite la base, sert à trouver le point de saturation)
k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com -e MAX_VUS=30 load-tests/search-journey.js
```

## Profils lourds demandes par le cahier de recette

Le test 10 000 utilisateurs pendant 24h et le pic 1 000 a 50 000 utilisateurs ne doivent pas être lances sur un poste local ni sur un hébergement gratuit Render. Les scripts exposent les variables `VUS`, `DURATION`, `PEAK_1` et `PEAK_2` pour exécuter ces profils dans une infrastructure dédiée.

Formulation soutenance conseillée :

> Les tests de charge ont été préparés avec k6. Sur l'hébergement gratuit Render, nous avons exécuté un profil modéré pour vérifier la disponibilité des parcours publics. Les profils lourds sont documentes mais nécessitent une infrastructure dédiée afin d'éviter des résultats biaises par les limites de l'offre gratuite.
