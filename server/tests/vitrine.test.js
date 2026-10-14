// Tests de la vitrine publique (page d'accueil) : les chiffres affichés viennent de la base.
const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

const app = require('../src/app');
const User = require('../src/models/User');
const Boat = require('../src/models/Boat');
const Booking = require('../src/models/Booking');
const Review = require('../src/models/Review');

let mongoServer;

test.before(async () => {
  if (process.env.TEST_MONGO_URI) {
    await mongoose.connect(process.env.TEST_MONGO_URI);
    return;
  }
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

test.after(async () => {
  await Promise.all([User.deleteMany({}), Boat.deleteMany({}), Booking.deleteMany({}), Review.deleteMany({})]);
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

const boatData = (owner, overrides) => ({
  owner,
  title: overrides.title,
  type: 'sailboat',
  description: 'Bateau de test suffisamment décrit pour valider les règles.',
  location: overrides.location,
  port: overrides.port,
  pricePerDay: 200,
  capacity: 6,
  images: ['https://example.com/boat.jpg'],
  status: overrides.status || 'approved',
});

test('Accueil : les chiffres clés sont calculés depuis la base (bateaux, ports, locations, note)', async () => {
  await Promise.all([User.deleteMany({}), Boat.deleteMany({}), Booking.deleteMany({}), Review.deleteMany({})]);

  const empty = await request(app).get('/api/boats/stats').expect(200);
  assert.deepEqual(empty.body, { boats: 0, ports: 0, trips: 0, averageRating: null, reviewCount: 0 });

  const owner = await User.create({
    firstName: 'Paul',
    lastName: 'Owner',
    email: 'owner-vitrine@sailingloc.test',
    password: 'Password123!',
    role: 'owner',
  });
  const tenant = await User.create({
    firstName: 'Lea',
    lastName: 'Tenant',
    email: 'tenant-vitrine@sailingloc.test',
    password: 'Password123!',
    role: 'tenant',
  });
  const [boatA, boatB] = await Boat.create([
    boatData(owner._id, { title: 'Voilier A', location: 'Marseille', port: 'Vieux-Port' }),
    boatData(owner._id, { title: 'Voilier B', location: 'Marseille', port: 'Vieux-Port' }),
    boatData(owner._id, { title: 'Voilier C', location: 'Brest', port: 'Port du Château' }),
    boatData(owner._id, { title: 'Voilier en attente', location: 'Nice', port: 'Port Lympia', status: 'pending' }),
  ]);

  const bookingBase = {
    tenant: tenant._id,
    owner: owner._id,
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-07-03'),
    numberOfDays: 2,
    pricePerDay: 200,
    serviceFee: 40,
    totalPrice: 440,
  };
  const [bookingA, bookingB] = await Booking.create([
    { ...bookingBase, boat: boatA._id, status: 'completed' },
    { ...bookingBase, boat: boatB._id, status: 'confirmed' },
    { ...bookingBase, boat: boatB._id, status: 'pending' },
  ]);
  await Review.create([
    {
      boat: boatA._id,
      booking: bookingA._id,
      author: tenant._id,
      rating: 5,
      comment: 'Très belle sortie.',
      status: 'approved',
    },
    {
      boat: boatB._id,
      booking: bookingB._id,
      author: tenant._id,
      rating: 4,
      comment: 'Bien, merci.',
      status: 'approved',
    },
  ]);

  const stats = await request(app).get('/api/boats/stats').expect(200);
  assert.deepEqual(stats.body, { boats: 3, ports: 2, trips: 2, averageRating: 4.5, reviewCount: 2 });
});
