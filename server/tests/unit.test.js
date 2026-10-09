// Tests unitaires : fonctions et middlewares testés seuls, sans base de données.
const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

const calculateBookingPrice = require('../src/utils/calculateBookingPrice');
const {
  rangesOverlap,
  hasUnavailableDateConflict,
  ACTIVE_BOOKING_STATUSES,
} = require('../src/utils/bookingAvailability');
const { parsePagination, paginatedResponse } = require('../src/utils/paginate');
const { buildBoatSlug } = require('../src/utils/slugify');
const generateToken = require('../src/utils/generateToken');
const asyncHandler = require('../src/utils/asyncHandler');
const { requireRole } = require('../src/middleware/roleMiddleware');
const { notFound, errorHandler } = require('../src/middleware/errorMiddleware');
const User = require('../src/models/User');

// Petit faux objet "res" d'Express pour tester les middlewares
const fakeRes = () => {
  const res = { statusCode: 200, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

test('Prix : 3 jours à 250 € donnent 750 € + 10 % de frais = 825 €', () => {
  const price = calculateBookingPrice('2026-07-10', '2026-07-13', 250);
  assert.deepEqual(price, { numberOfDays: 3, pricePerDay: 250, serviceFee: 75, totalPrice: 825 });
});

test('Prix : une location le jour même compte au minimum 1 jour', () => {
  const price = calculateBookingPrice('2026-07-10', '2026-07-10', 100);
  assert.equal(price.numberOfDays, 1);
  assert.equal(price.totalPrice, 110);
});

test('Prix : les frais de service sont arrondis au centime', () => {
  const price = calculateBookingPrice('2026-07-10', '2026-07-11', 99.99);
  assert.equal(price.serviceFee, 10);
  assert.equal(price.totalPrice, 109.99);
});

test('Disponibilité : deux périodes qui se chevauchent sont détectées', () => {
  const d = (day) => new Date(2026, 6, day);
  assert.equal(rangesOverlap(d(10), d(13), d(12), d(15)), true);
  assert.equal(rangesOverlap(d(10), d(13), d(5), d(20)), true);
});

test('Disponibilité : une location peut commencer le jour où la précédente se termine', () => {
  const d = (day) => new Date(2026, 6, day);
  assert.equal(rangesOverlap(d(10), d(13), d(13), d(15)), false);
  assert.equal(rangesOverlap(d(10), d(13), d(1), d(10)), false);
});

test('Disponibilité : une date bloquée par le propriétaire empêche la réservation', () => {
  const boat = { unavailableDates: [new Date(2026, 6, 12)] };
  assert.equal(hasUnavailableDateConflict(boat, new Date(2026, 6, 10), new Date(2026, 6, 13)), true);
  assert.equal(hasUnavailableDateConflict(boat, new Date(2026, 6, 13), new Date(2026, 6, 15)), false);
  assert.equal(hasUnavailableDateConflict({}, new Date(2026, 6, 10), new Date(2026, 6, 13)), false);
});

test('Disponibilité : seules les réservations actives bloquent les dates', () => {
  assert.deepEqual(ACTIVE_BOOKING_STATUSES, ['pending', 'accepted', 'confirmed']);
});

test('Pagination : valeurs par défaut et limites', () => {
  assert.deepEqual(parsePagination(), { page: 1, limit: 10, skip: 0 });
  assert.deepEqual(parsePagination({ page: '3', limit: '20' }), { page: 3, limit: 20, skip: 40 });
  assert.deepEqual(parsePagination({ page: '-2', limit: '500' }), { page: 1, limit: 100, skip: 0 });
  assert.deepEqual(parsePagination({ page: 'abc', limit: 'abc' }), { page: 1, limit: 10, skip: 0 });
});

test('Pagination : calcul du nombre de pages', () => {
  assert.equal(paginatedResponse([], 1, 10, 25).totalPages, 3);
  assert.equal(paginatedResponse([], 1, 10, 0).totalPages, 1);
});

test('SEO : le slug du bateau combine le titre et la ville', () => {
  assert.equal(buildBoatSlug('Lagoon 42', 'Saint-Tropez'), 'lagoon-42-saint-tropez');
  assert.equal(buildBoatSlug('', ''), 'bateau');
});

test('Connexion : le jeton JWT contient l’identifiant et expire', () => {
  const token = generateToken('abc123');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assert.equal(decoded.id, 'abc123');
  assert.ok(decoded.exp > decoded.iat);
  assert.throws(() => jwt.verify(token, 'mauvais_secret'));
});

test('Mot de passe : comparaison avec le mot de passe haché (bcrypt)', async () => {
  const user = new User({ password: await bcrypt.hash('Password123!', 10) });
  assert.equal(await user.matchPassword('Password123!'), true);
  assert.equal(await user.matchPassword('mauvais'), false);
});

test('Mot de passe : il n’est jamais renvoyé dans les réponses JSON', () => {
  const user = new User({ firstName: 'Rayen', email: 'rayen@sailingloc.test', password: 'secret' });
  const json = user.toJSON();
  assert.equal(json.password, undefined);
  assert.equal(json.email, 'rayen@sailingloc.test');
});

test('Rôles : un rôle autorisé passe, un autre rôle reçoit 403', () => {
  const middleware = requireRole('owner', 'admin');
  let called = false;
  middleware({ user: { role: 'admin' } }, fakeRes(), () => {
    called = true;
  });
  assert.equal(called, true);

  const res = fakeRes();
  assert.throws(() => middleware({ user: { role: 'tenant' } }, res, () => {}), /insufficient role/);
  assert.equal(res.statusCode, 403);
  assert.throws(() => middleware({}, fakeRes(), () => {}), /insufficient role/);
});

test('Erreurs : une route inconnue renvoie 404', () => {
  const res = fakeRes();
  let error;
  notFound({ originalUrl: '/api/inconnue' }, res, (err) => {
    error = err;
  });
  assert.equal(res.statusCode, 404);
  assert.match(error.message, /Not Found - \/api\/inconnue/);
});

test('Erreurs : le gestionnaire renvoie le bon code et un message', () => {
  const res = fakeRes();
  const err = new Error('Boat already has a booking for the selected dates');
  err.statusCode = 409;
  errorHandler(err, { method: 'POST', originalUrl: '/api/bookings' }, res, () => {});
  assert.equal(res.statusCode, 409);
  assert.equal(res.body.message, 'Boat already has a booking for the selected dates');

  const res500 = fakeRes();
  errorHandler(new Error('Panne'), { method: 'GET', originalUrl: '/' }, res500, () => {});
  assert.equal(res500.statusCode, 500);
});

test('Erreurs : asyncHandler transmet les erreurs des fonctions asynchrones', async () => {
  const handler = asyncHandler(async () => {
    throw new Error('Erreur asynchrone');
  });
  const error = await new Promise((resolve) => {
    handler({}, fakeRes(), resolve);
  });
  assert.equal(error.message, 'Erreur asynchrone');
});
