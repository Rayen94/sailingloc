# Rapports et captures

## Rapports du rattrapage (octobre 2026)

| Fichier | Contenu |
| --- | --- |
| `couverture-serveur-avant-2026-10-08.txt` | Tests serveur et couverture du code d'origine (32 tests, 74,7 % des lignes) |
| `couverture-serveur-2026-10-08.txt` | Tests serveur et couverture après corrections (57 tests, 80,18 % des lignes) |
| `e2e-chromium-2026-10-09.txt` | 13 tests E2E Playwright sur Chromium |
| `e2e-chromium-2026-10-12.txt` | Mêmes 13 tests, relancés après la correction des accents du site |
| `lighthouse/` | 5 rapports Lighthouse (accueil et catalogue, avant et après corrections) |
| `e2e-serveur-reel-2026-10-08.txt` | Les tests E2E relancés une fois avec le vrai serveur et une base de démonstration (12 tests) |
| `parcours-reservation-paiement-2026-10-12.txt` et `captures/` | Parcours complet dans le navigateur : acceptation par le propriétaire, paiement simulé, facture |
| `../../load-tests/results/2026-10-08-local/` | Campagne de tests de charge k6 du 08/10/2026 |


Ce dossier sert a stocker les preuves de soutenance générées localement :

- rapports Lighthouse ;
- exports accessibilité ;
- captures écran Playwright ;
- résultats de test de charge.

Les fichiers lourds générés automatiquement peuvent rester locaux et être fournis dans le dossier de rendu final.

## Captures

```bash
npm run screenshots
```

Sortie :

```txt
docs/reports/screenshots/
```

## Lighthouse

Exemple :

```bash
npx lighthouse https://dsp-dev-o24a-g6-fr.onrender.com/ --output=html --output-path=docs/reports/lighthouse-home.html
```
