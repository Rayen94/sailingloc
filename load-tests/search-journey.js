// Parcours de recherche réaliste : chaque visiteur cherche avec des filtres et des dates différents,
// puis ouvre la fiche d'un bateau et ses avis. Les filtres changent à chaque fois, donc le cache
// de la liste des bateaux sert peu : ce test sollicite vraiment la base de données.
//
// Exemple : k6 run -e BASE_URL=https://dsp-dev-o24a-g6-fr.onrender.com -e MAX_VUS=30 load-tests/search-journey.js
import http from 'k6/http';
import { check, group, sleep } from 'k6';

const baseUrl = (__ENV.BASE_URL || 'https://dsp-dev-o24a-g6-fr.onrender.com').replace(/\/$/, '');
const maxVus = Number(__ENV.MAX_VUS || 200);
const step = __ENV.STEP || '1m';

export const options = {
  scenarios: {
    search_ramp: {
      executor: 'ramping-vus',
      stages: [
        { duration: step, target: Math.round(maxVus * 0.05) || 1 },
        { duration: step, target: Math.round(maxVus * 0.25) || 1 },
        { duration: step, target: Math.round(maxVus * 0.5) || 1 },
        { duration: step, target: maxVus },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '10s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1200'],
    checks: ['rate>0.95'],
  },
};

const types = ['sailboat', 'motorboat', 'catamaran', 'rib'];
const cities = ['Marseille', 'Nice', 'Cannes', 'La Rochelle', 'Brest', 'Antibes', 'Ajaccio', 'Toulon', ''];
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const isoDay = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

export default function () {
  let boats = [];
  group('Recherche avec filtres', () => {
    const start = 1 + Math.floor(Math.random() * 120);
    const params = [
      `type=${pick(types)}`,
      `startDate=${isoDay(start)}`,
      `endDate=${isoDay(start + 1 + Math.floor(Math.random() * 6))}`,
    ];
    const city = pick(cities);
    if (city) params.push(`location=${encodeURIComponent(city)}`);
    const res = http.get(`${baseUrl}/api/boats?${params.join('&')}`, { tags: { endpoint: 'search' } });
    check(res, { 'search returns 200': (r) => r.status === 200 });
    try {
      boats = res.json('boats') || [];
    } catch {
      boats = [];
    }
  });
  sleep(1);

  if (boats.length === 0) {
    const all = http.get(`${baseUrl}/api/boats?limit=12&page=${1 + Math.floor(Math.random() * 3)}`, {
      tags: { endpoint: 'list' },
    });
    check(all, { 'list returns 200': (r) => r.status === 200 });
    try {
      boats = all.json('boats') || [];
    } catch {
      boats = [];
    }
  }

  const boat = boats.length ? pick(boats) : null;
  if (boat && boat.slug) {
    group('Fiche bateau et avis', () => {
      const detail = http.get(`${baseUrl}/api/boats/slug/${boat.slug}`, { tags: { endpoint: 'detail' } });
      check(detail, { 'detail returns 200': (r) => r.status === 200 });
      const reviews = http.get(`${baseUrl}/api/boats/${boat._id}/reviews`, { tags: { endpoint: 'reviews' } });
      check(reviews, { 'reviews return 200': (r) => r.status < 400 });
    });
  }
  sleep(1);
}
