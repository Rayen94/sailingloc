import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const input = process.argv[2] || path.join(root, 'load-tests', 'results', 'oral-demo.json');
const output = process.argv[3] || path.join(root, 'load-tests', 'results', 'oral-demo-report.md');

const summary = JSON.parse(readFileSync(input, 'utf8'));
const metrics = summary.metrics || {};
const now = new Date().toISOString();

// Deux formats possibles : --summary-export (valeurs directement dans la métrique, taux dans "value")
// et handleSummary (valeurs dans "values", taux dans "rate").
const value = (metric, key, fallback = 0) => {
  const m = metrics[metric];
  if (!m) return fallback;
  const source = m.values || m;
  if (key === 'rate') return source.rate ?? source.value ?? fallback;
  return source[key] ?? fallback;
};
const count = (metric) => Math.round(value(metric, 'count'));
const ms = (number) => `${Number(number || 0).toFixed(0)} ms`;
const percent = (number) => `${(Number(number || 0) * 100).toFixed(2).replace('.', ',')} %`;

const failedRate = value('http_req_failed', 'rate');
const checksRate = value('checks', 'rate');
const p95 = value('http_req_duration', 'p(95)');
const avg = value('http_req_duration', 'avg');

const status =
  failedRate < 0.08 && checksRate > 0.92
    ? 'Acceptable pour une démonstration du MVP sur un hébergement gratuit'
    : 'À surveiller : limites atteintes sur l\'hébergement gratuit';

const report = `# Rapport k6 SailingLoc - Démonstration de l'oral

Rapport généré le : ${now}${process.env.TEST_DATE ? `\n\nDate du test : ${process.env.TEST_DATE}` : ''}

## Objectif

Vérifier que les pages publiques et les points d'accès critiques de l'API restent accessibles sous une charge modérée, compatible avec l'offre gratuite de Render.

## Résultats

| Indicateur | Valeur |
| --- | ---: |
| Requêtes HTTP | ${count('http_reqs')} |
| Durée moyenne | ${ms(avg)} |
| p95 global | ${ms(p95)} |
| Taux d'erreurs HTTP | ${percent(failedRate)} |
| Contrôles réussis | ${percent(checksRate)} |

## Conclusion

${status}.

## Lecture pour la soutenance

Ce test ne valide pas 10 000 utilisateurs pendant 24 h. Il valide un parcours public qu'il est réaliste de tester sur une infrastructure gratuite. Les tests lourds doivent être exécutés sur une infrastructure dédiée, avec des quotas réseau et une base de données adaptés.
`;

mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, report, 'utf8');
console.log(`Rapport k6 généré : ${output}`);
