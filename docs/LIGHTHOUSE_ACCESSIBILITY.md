# Audit Lighthouse et accessibilite - SailingLoc

## Objectif

Produire une preuve de qualite front-end pour la soutenance :

- performance percue ;
- accessibilite ;
- bonnes pratiques ;
- SEO ;
- absence de regressions responsive majeures.

## Pages a tester

| Page | URL production |
| --- | --- |
| Accueil | `https://dsp-dev-o24a-g6-fr.onrender.com/` |
| Catalogue | `https://dsp-dev-o24a-g6-fr.onrender.com/boats` |
| Fiche bateau | `https://dsp-dev-o24a-g6-fr.onrender.com/boats/<id-ou-slug>` |
| Connexion | `https://dsp-dev-o24a-g6-fr.onrender.com/login` |
| Inscription | `https://dsp-dev-o24a-g6-fr.onrender.com/register` |
| Contact | `https://dsp-dev-o24a-g6-fr.onrender.com/contact` |
| Limites MVP | `https://dsp-dev-o24a-g6-fr.onrender.com/mvp-limitations` |

## Procedure Chrome DevTools

1. Ouvrir Chrome en navigation privee.
2. Aller sur la page a tester.
3. Ouvrir DevTools.
4. Onglet `Lighthouse`.
5. Mode `Mobile`, categories :
   - Performance ;
   - Accessibility ;
   - Best Practices ;
   - SEO.
6. Lancer l'audit.
7. Exporter le rapport en HTML/PDF.
8. Refaire sur `Desktop` pour l'accueil et le catalogue.

## Procedure CLI optionnelle

```bash
npx lighthouse https://dsp-dev-o24a-g6-fr.onrender.com/ \
  --preset=desktop \
  --output=html \
  --output-path=docs/reports/lighthouse-home-desktop.html
```

Mobile :

```bash
npx lighthouse https://dsp-dev-o24a-g6-fr.onrender.com/ \
  --form-factor=mobile \
  --screenEmulation.mobile=true \
  --output=html \
  --output-path=docs/reports/lighthouse-home-mobile.html
```

## Tests accessibilite manuels

Verifier :

- navigation clavier avec `Tab`, `Shift+Tab`, `Enter` ;
- focus visible sur liens, boutons, champs ;
- labels lisibles sur formulaires ;
- textes contrastes sur fonds sombres ;
- menu mobile ouvrable au clavier ;
- images principales avec attribut `alt` ;
- aucun scroll horizontal involontaire en 360px.

## Résultats (08 et 09/10/2026)

Lighthouse 12.8.2, site construit en mode production et lancé sur la machine de test (pas sur Render).
Rapports complets (JSON, à ouvrir avec le Lighthouse Viewer de Chrome) : `docs/reports/lighthouse/`.

| Page | Mode | Performance | Accessibilité | Bonnes pratiques | SEO |
| --- | --- | ---: | ---: | ---: | ---: |
| Accueil, avant corrections (08/10) | Ordinateur | 96 | 91 | 96 | 100 |
| Accueil, après corrections (09/10) | Ordinateur | 99 | 100 | 96 | 100 |
| Accueil, après corrections (08/10) | Mobile | 78 | 100 | 96 | 100 |
| Catalogue, avant corrections (08/10) | Ordinateur | 88 | 95 | 96 | 100 |
| Catalogue, après corrections (09/10) | Ordinateur | 94 | 100 | 96 | 100 |

Corrections faites : contrastes des textes gris et cyan, ordre des titres du pied de page, rôle des étoiles
des avis, noms accessibles identiques au texte affiché, lien d'évitement, compression gzip.
Restent à auditer : fiche bateau, connexion, contact, et le site en ligne sur Render (la performance au
premier chargement y sera plus basse : offre gratuite, mise en veille). La performance mobile (78) est
limitée par le poids des photos (passage au format WebP prévu dans le plan de maintenance).

## Formulation soutenance

> Une passe UI responsive a ete realisee sur les composants critiques : navigation, cards, formulaires, galeries, dashboards et footer. Les controles Lighthouse/accessibilite servent de preuve qualite. Les optimisations restantes avant production concernent surtout l'optimisation avancee des images et le suivi automatise des Core Web Vitals.
