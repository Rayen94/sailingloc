const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'test_secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';

const app = require('../src/app');
const User = require('../src/models/User');
const Boat = require('../src/models/Boat');
const Booking = require('../src/models/Booking');
const Review = require('../src/models/Review');
const Payment = require('../src/models/Payment');
const Notification = require('../src/models/Notification');
const OwnerDocument = require('../src/models/OwnerDocument');
const Report = require('../src/models/Report');
const AdminActionLog = require('../src/models/AdminActionLog');
const ContactMessage = require('../src/models/ContactMessage');
const NewsletterSubscriber = require('../src/models/NewsletterSubscriber');
const { uploadRoot } = require('../src/middleware/uploadMiddleware');
const { confirmStripePayment } = require('../src/controllers/paymentController');
const slugify = require('../src/utils/slugify');
const { buildBoatSlug } = require('../src/utils/slugify');

let mongoServer;

test.before(async () => {
  if (process.env.TEST_MONGO_URI) {
    await mongoose.connect(process.env.TEST_MONGO_URI);
    return;
  }

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

test.afterEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Boat.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    Payment.deleteMany({}),
    Notification.deleteMany({}),
    OwnerDocument.deleteMany({}),
    Report.deleteMany({}),
    AdminActionLog.deleteMany({}),
    ContactMessage.deleteMany({}),
    NewsletterSubscriber.deleteMany({}),
  ]);
});

test.after(async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
});

const futureDate = (daysFromNow) => {
  const date = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0];
};

const createUser = (overrides = {}) =>
  User.create({
    firstName: overrides.firstName || 'Test',
    lastName: overrides.lastName || 'User',
    email: overrides.email || `user-${Date.now()}@sailingloc.test`,
    password: overrides.password || 'Password123!',
    role: overrides.role || 'tenant',
    phone: overrides.phone || '+33600000000',
  });

const loginAs = async (email, password = 'Password123!') => {
  const response = await request(app).post('/api/auth/login').send({ email, password }).expect(200);

  return response.body.token;
};

const createApprovedBoat = async (ownerId, overrides = {}) =>
  Boat.create({
    owner: ownerId,
    title: overrides.title || 'Voilier Test',
    type: overrides.type || 'sailboat',
    description: overrides.description || 'Bateau de test suffisamment decrit pour valider les regles.',
    location: overrides.location || 'Marseille',
    port: overrides.port || 'Vieux-Port',
    pricePerDay: overrides.pricePerDay || 250,
    capacity: overrides.capacity || 6,
    skipperAvailable: overrides.skipperAvailable || false,
    equipments: overrides.equipments || ['GPS'],
    images: overrides.images || ['https://example.com/boat.jpg'],
    unavailableDates: overrides.unavailableDates || [],
    status: overrides.status || 'approved',
  });

test('Auth API: registers, logs in and returns the connected profile', async () => {
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      firstName: 'Alice',
      lastName: 'Martin',
      email: 'alice@sailingloc.test',
      password: 'Password123!',
      role: 'tenant',
      privacyConsent: true,
    })
    .expect(201);

  assert.ok(registerResponse.body.token);
  assert.equal(registerResponse.body.user.role, 'tenant');

  const token = await loginAs('alice@sailingloc.test');

  const profileResponse = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);

  assert.equal(profileResponse.body.email, 'alice@sailingloc.test');
  assert.equal(profileResponse.body.password, undefined);
});

test('Auth API: sends a reset token and updates the password through the reset flow', async () => {
  const user = await createUser({ email: 'reset@sailingloc.test', password: 'OldPassword123!' });
  const fixedTokenBuffer = Buffer.alloc(32, 1);
  const fixedToken = fixedTokenBuffer.toString('hex');
  const originalRandomBytes = crypto.randomBytes;
  crypto.randomBytes = () => fixedTokenBuffer;

  try {
    const forgotResponse = await request(app).post('/api/auth/forgot-password').send({ email: user.email }).expect(200);

    assert.match(forgotResponse.body.message, /réinitialisation/);
  } finally {
    crypto.randomBytes = originalRandomBytes;
  }

  const userWithToken = await User.findById(user._id).select('+passwordResetToken +passwordResetExpires');
  assert.ok(userWithToken.passwordResetToken);
  assert.ok(userWithToken.passwordResetExpires > new Date());
  assert.notEqual(userWithToken.passwordResetToken, fixedToken);

  await request(app).post(`/api/auth/reset-password/${fixedToken}`).send({ password: 'NewPassword123!' }).expect(200);

  await request(app).post('/api/auth/login').send({ email: user.email, password: 'OldPassword123!' }).expect(401);

  await request(app).post('/api/auth/login').send({ email: user.email, password: 'NewPassword123!' }).expect(200);

  const userAfterReset = await User.findById(user._id).select('+passwordResetToken +passwordResetExpires');
  assert.equal(userAfterReset.passwordResetToken, undefined);
  assert.equal(userAfterReset.passwordResetExpires, undefined);
});

test('Auth API: rejects expired password reset tokens', async () => {
  const user = await createUser({ email: 'expired-reset@sailingloc.test' });
  const expiredToken = 'a'.repeat(64);
  user.passwordResetToken = crypto.createHash('sha256').update(expiredToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() - 60 * 1000);
  await user.save({ validateBeforeSave: false });

  await request(app).post(`/api/auth/reset-password/${expiredToken}`).send({ password: 'NewPassword123!' }).expect(400);
});

test('Boats API: owner creates a pending boat and admin approves it for public listing', async () => {
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const admin = await createUser({ email: 'admin@sailingloc.test', role: 'admin' });
  const tenantToken = await loginAs(tenant.email);
  const ownerToken = await loginAs(owner.email);
  const adminToken = await loginAs(admin.email);

  await request(app)
    .post('/api/boats')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      title: 'Bateau refuse',
      type: 'sailboat',
      description: 'Un locataire ne doit pas pouvoir creer cette annonce.',
      location: 'Nice',
      pricePerDay: 200,
      capacity: 4,
    })
    .expect(403);

  const createResponse = await request(app)
    .post('/api/boats')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({
      title: 'Dufour 390',
      type: 'sailboat',
      description: 'Voilier confortable pour une croisiere cotiere.',
      location: 'Brest',
      pricePerDay: 290,
      capacity: 6,
      images: ['https://example.com/dufour.jpg'],
    })
    .expect(201);

  assert.equal(createResponse.body.status, 'pending');
  assert.equal(createResponse.body.slug, 'dufour-390-brest');

  const hiddenListing = await request(app).get('/api/boats').expect(200);
  assert.equal(hiddenListing.body.boats.length, 0);

  await request(app)
    .patch(`/api/admin/boats/${createResponse.body._id}/approve`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);

  const publicListing = await request(app).get('/api/boats').expect(200);
  assert.equal(publicListing.body.boats.length, 1);
  assert.equal(publicListing.body.boats[0].title, 'Dufour 390');
  assert.equal(publicListing.body.boats[0].slug, 'dufour-390-brest');

  const slugDetail = await request(app).get('/api/boats/dufour-390-brest').expect(200);
  assert.equal(slugDetail.body._id, createResponse.body._id);

  const idDetail = await request(app).get(`/api/boats/${createResponse.body._id}`).expect(200);
  assert.equal(idDetail.body.slug, 'dufour-390-brest');
});

test('Boats API: accepts persisted data URL images for owner uploads', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const ownerToken = await loginAs(owner.email);
  const imageDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2w==';

  const response = await request(app)
    .post('/api/boats')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({
      title: 'Photo persistante',
      type: 'sailboat',
      description: 'Annonce avec une image stockee directement dans les donnees.',
      location: 'Marseille',
      pricePerDay: 290,
      capacity: 6,
      images: [imageDataUrl],
    })
    .expect(201);

  assert.equal(response.body.images[0], imageDataUrl);
});

test('Boats API: backfills missing slugs on legacy public boats', async () => {
  const owner = await createUser({ email: 'owner-legacy-slug@sailingloc.test', role: 'owner' });
  const legacyBoat = await createApprovedBoat(owner._id, {
    title: 'Sun Odyssey 349',
    location: 'Marseille',
  });

  assert.equal(legacyBoat.slug, undefined);

  const listing = await request(app).get('/api/boats').expect(200);
  assert.equal(listing.body.boats[0].slug, 'sun-odyssey-349-marseille');

  const detail = await request(app).get(`/api/boats/${legacyBoat._id}`).expect(200);
  assert.equal(detail.body.slug, 'sun-odyssey-349-marseille');

  const savedBoat = await Boat.findById(legacyBoat._id).lean();
  assert.equal(savedBoat.slug, 'sun-odyssey-349-marseille');
});

test('Public health and boats endpoints bypass global API rate limit', async () => {
  const owner = await createUser({ email: 'owner-rate-limit@sailingloc.test', role: 'owner' });
  await createApprovedBoat(owner._id, { title: 'Rate Limit Boat', location: 'Toulon' });

  for (let index = 0; index < 12; index += 1) {
    await request(app).get('/api/health').expect(200);
    await request(app).get('/api/boats?limit=6').expect(200);
  }
});

test('Boats API: filters out boats unavailable for selected dates', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const blockedBoat = await createApprovedBoat(owner._id, { title: 'Bateau deja demande' });
  const availableBoat = await createApprovedBoat(owner._id, { title: 'Bateau disponible' });

  await Booking.create({
    boat: blockedBoat._id,
    tenant: tenant._id,
    owner: owner._id,
    startDate: new Date(futureDate(20)),
    endDate: new Date(futureDate(23)),
    numberOfDays: 3,
    pricePerDay: blockedBoat.pricePerDay,
    serviceFee: 75,
    totalPrice: 825,
    status: 'pending',
  });

  const response = await request(app)
    .get('/api/boats')
    .query({ startDate: futureDate(21), endDate: futureDate(22) })
    .expect(200);

  const titles = response.body.boats.map((boat) => boat.title);
  assert.deepEqual(titles, [availableBoat.title]);
});

test('Boats API: exposes active booking dates as unavailable on boat detail', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const boat = await createApprovedBoat(owner._id, { unavailableDates: [new Date(futureDate(18))] });

  await Booking.create({
    boat: boat._id,
    tenant: tenant._id,
    owner: owner._id,
    startDate: new Date(futureDate(10)),
    endDate: new Date(futureDate(13)),
    numberOfDays: 3,
    pricePerDay: boat.pricePerDay,
    serviceFee: 75,
    totalPrice: 825,
    status: 'confirmed',
  });

  const response = await request(app)
    .get(`/api/boats/slug/${boat.slug || boat._id}`)
    .expect(200);
  const unavailableDays = response.body.unavailableDates.map((date) => date.slice(0, 10));

  assert.ok(unavailableDays.includes(futureDate(10)));
  assert.ok(unavailableDays.includes(futureDate(11)));
  assert.ok(unavailableDays.includes(futureDate(12)));
  assert.ok(unavailableDays.includes(futureDate(18)));
});

test('Bookings API: creates, accepts, pays and completes a booking while blocking overlaps', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const otherTenant = await createUser({ email: 'other@sailingloc.test', role: 'tenant' });
  const ownerToken = await loginAs(owner.email);
  const tenantToken = await loginAs(tenant.email);
  const otherTenantToken = await loginAs(otherTenant.email);
  const boat = await createApprovedBoat(owner._id);

  const bookingResponse = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      boatId: boat._id.toString(),
      startDate: futureDate(10),
      endDate: futureDate(13),
    })
    .expect(201);

  assert.equal(bookingResponse.body.status, 'pending');
  assert.equal(bookingResponse.body.totalPrice, 825);

  await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${otherTenantToken}`)
    .send({
      boatId: boat._id.toString(),
      startDate: futureDate(11),
      endDate: futureDate(12),
    })
    .expect(409);

  const accepted = await request(app)
    .patch(`/api/bookings/${bookingResponse.body._id}/accept`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .expect(200);

  assert.equal(accepted.body.status, 'accepted');

  const paid = await request(app)
    .patch(`/api/bookings/${bookingResponse.body._id}/pay`)
    .set('Authorization', `Bearer ${tenantToken}`)
    .expect(200);

  assert.equal(paid.body.status, 'confirmed');
  assert.equal(paid.body.paymentStatus, 'paid');
  assert.ok(paid.body.payment);

  const payment = await Payment.findOne({ booking: bookingResponse.body._id });
  assert.equal(payment.provider, 'simulated');
  assert.equal(payment.status, 'paid');
  assert.equal(payment.amount, 825);
  assert.match(payment.invoiceNumber, /^SL-\d{4}-[A-F0-9]{8}$/);
  assert.match(payment.invoiceUrl, /^\/uploads\/invoices\/SL-\d{4}-[A-F0-9]{8}\.pdf$/);
  assert.ok(fs.existsSync(path.join(uploadRoot, payment.invoiceUrl.replace('/uploads/', ''))));

  const ownerNotifications = await Notification.find({ user: owner._id });
  assert.ok(ownerNotifications.some((notification) => notification.type === 'booking_created'));
  assert.ok(ownerNotifications.some((notification) => notification.type === 'booking_paid'));

  const completed = await request(app)
    .patch(`/api/bookings/${bookingResponse.body._id}/complete`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .expect(200);

  assert.equal(completed.body.status, 'completed');
});

test('Bookings API: admin can accept or reject a booking, another tenant cannot', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const admin = await createUser({ email: 'admin@sailingloc.test', role: 'admin' });
  const tenantToken = await loginAs(tenant.email);
  const adminToken = await loginAs(admin.email);
  const boat = await createApprovedBoat(owner._id);

  const createBooking = (start, end) =>
    request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({ boatId: boat._id.toString(), startDate: futureDate(start), endDate: futureDate(end) })
      .expect(201);

  const first = await createBooking(40, 42);
  const second = await createBooking(50, 52);

  await request(app)
    .patch(`/api/bookings/${first.body._id}/accept`)
    .set('Authorization', `Bearer ${tenantToken}`)
    .expect(403);

  const accepted = await request(app)
    .patch(`/api/bookings/${first.body._id}/accept`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);
  assert.equal(accepted.body.status, 'accepted');

  const rejected = await request(app)
    .patch(`/api/bookings/${second.body._id}/reject`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);
  assert.equal(rejected.body.status, 'rejected');
});

test('Payments API: Stripe checkout returns a clean error when Stripe is disabled', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const ownerToken = await loginAs(owner.email);
  const tenantToken = await loginAs(tenant.email);
  const boat = await createApprovedBoat(owner._id);

  const bookingResponse = await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      boatId: boat._id.toString(),
      startDate: futureDate(30),
      endDate: futureDate(32),
    })
    .expect(201);

  await request(app)
    .patch(`/api/bookings/${bookingResponse.body._id}/accept`)
    .set('Authorization', `Bearer ${ownerToken}`)
    .expect(200);

  const response = await request(app)
    .post('/api/payments/stripe/create-checkout-session')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({ bookingId: bookingResponse.body._id })
    .expect(503);

  assert.equal(response.body.message, 'Stripe payment is not configured.');
});

test('Payments API: Stripe completion confirms booking once and generates invoice', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const boat = await createApprovedBoat(owner._id);
  const booking = await Booking.create({
    boat: boat._id,
    tenant: tenant._id,
    owner: owner._id,
    startDate: new Date(futureDate(35)),
    endDate: new Date(futureDate(37)),
    numberOfDays: 2,
    pricePerDay: 250,
    serviceFee: 50,
    totalPrice: 550,
    status: 'accepted',
    paymentStatus: 'unpaid',
  });
  const payment = await Payment.create({
    booking: booking._id,
    tenant: tenant._id,
    owner: owner._id,
    boat: boat._id,
    amount: 550,
    serviceFee: 50,
    provider: 'stripe',
    status: 'pending',
    currency: 'EUR',
    stripeCheckoutSessionId: 'cs_test_sailingloc',
  });

  const session = {
    id: 'cs_test_sailingloc',
    amount_total: 55000,
    currency: 'eur',
    payment_intent: 'pi_test_sailingloc',
    customer_email: tenant.email,
    customer_details: { email: tenant.email },
    metadata: {
      bookingId: booking._id.toString(),
      paymentId: payment._id.toString(),
      tenantId: tenant._id.toString(),
      ownerId: owner._id.toString(),
      boatId: boat._id.toString(),
    },
  };

  await confirmStripePayment(session);
  await confirmStripePayment(session);

  const updatedBooking = await Booking.findById(booking._id);
  const updatedPayment = await Payment.findById(payment._id);
  assert.equal(updatedBooking.status, 'confirmed');
  assert.equal(updatedBooking.paymentStatus, 'paid');
  assert.equal(updatedPayment.status, 'paid');
  assert.equal(updatedPayment.stripePaymentIntentId, 'pi_test_sailingloc');
  assert.match(updatedPayment.invoiceNumber, /^SL-\d{4}-[A-F0-9]{8}$/);
  assert.match(updatedPayment.invoiceUrl, /^\/uploads\/invoices\/SL-\d{4}-[A-F0-9]{8}\.pdf$/);
});

test('Documents and RGPD API: owner submits a document, admin reviews it, user exports data', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const admin = await createUser({ email: 'admin@sailingloc.test', role: 'admin' });
  const ownerToken = await loginAs(owner.email);
  const adminToken = await loginAs(admin.email);
  const boat = await createApprovedBoat(owner._id);

  const documentResponse = await request(app)
    .post('/api/documents')
    .set('Authorization', `Bearer ${ownerToken}`)
    .send({
      boatId: boat._id.toString(),
      type: 'insurance',
      title: 'Attestation assurance 2026',
      fileUrl: 'https://example.com/documents/assurance.pdf',
    })
    .expect(201);

  assert.equal(documentResponse.body.status, 'pending');

  const reviewed = await request(app)
    .patch(`/api/documents/${documentResponse.body._id}/review`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'approved' })
    .expect(200);

  assert.equal(reviewed.body.status, 'approved');

  const exportResponse = await request(app)
    .get('/api/auth/me/export')
    .set('Authorization', `Bearer ${ownerToken}`)
    .expect(200);

  assert.equal(exportResponse.body.user.email, owner.email);
  assert.equal(exportResponse.body.documents.length, 1);
});

test('Bookings API: rejects a booking when the owner marked a date unavailable', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const tenantToken = await loginAs(tenant.email);
  const boat = await createApprovedBoat(owner._id, {
    unavailableDates: [new Date(futureDate(15))],
  });

  await request(app)
    .post('/api/bookings')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      boatId: boat._id.toString(),
      startDate: futureDate(14),
      endDate: futureDate(16),
    })
    .expect(409);
});

test('Reviews API: tenant reviews a completed booking and admin approves the review', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const admin = await createUser({ email: 'admin@sailingloc.test', role: 'admin' });
  const tenantToken = await loginAs(tenant.email);
  const adminToken = await loginAs(admin.email);
  const boat = await createApprovedBoat(owner._id);
  const booking = await Booking.create({
    boat: boat._id,
    tenant: tenant._id,
    owner: owner._id,
    startDate: new Date(futureDate(1)),
    endDate: new Date(futureDate(3)),
    numberOfDays: 2,
    pricePerDay: 250,
    serviceFee: 50,
    totalPrice: 550,
    status: 'completed',
    paymentStatus: 'paid',
  });

  const reviewResponse = await request(app)
    .post('/api/reviews')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({
      boatId: boat._id.toString(),
      bookingId: booking._id.toString(),
      rating: 5,
      comment: 'Tres bonne experience, bateau conforme et proprietaire serieux.',
    })
    .expect(201);

  assert.equal(reviewResponse.body.status, 'pending');

  const hiddenReviews = await request(app).get(`/api/boats/${boat._id}/reviews`).expect(200);
  assert.equal(hiddenReviews.body.length, 0);

  await request(app)
    .patch(`/api/admin/reviews/${reviewResponse.body._id}/approve`)
    .set('Authorization', `Bearer ${adminToken}`)
    .expect(200);

  const visibleReviews = await request(app).get(`/api/boats/${boat._id}/reviews`).expect(200);

  assert.equal(visibleReviews.body.length, 1);
  assert.equal(visibleReviews.body[0].rating, 5);

  const updatedBoat = await Boat.findById(boat._id);
  assert.equal(updatedBoat.averageRating, 5);
});

test('Reviews API: latest public reviews are ordered by most recent approval update', async () => {
  const owner = await createUser({ email: 'owner-latest@sailingloc.test', role: 'owner' });
  const tenant = await createUser({ email: 'tenant-latest@sailingloc.test', role: 'tenant' });
  const boat = await createApprovedBoat(owner._id, { title: 'Latest Review Boat' });

  const oldReview = await Review.create({
    boat: boat._id,
    booking: new mongoose.Types.ObjectId(),
    author: tenant._id,
    rating: 4,
    comment: 'Avis deja approuve plus ancien.',
    status: 'approved',
  });
  const recentlyApprovedReview = await Review.create({
    boat: boat._id,
    booking: new mongoose.Types.ObjectId(),
    author: tenant._id,
    rating: 5,
    comment: 'Avis approuve recemment a afficher en premier.',
    status: 'approved',
  });
  await Review.updateOne(
    { _id: oldReview._id },
    {
      $set: {
        createdAt: new Date('2026-01-01T10:00:00.000Z'),
        updatedAt: new Date('2026-01-01T10:00:00.000Z'),
      },
    },
    { timestamps: false }
  );
  await Review.updateOne(
    { _id: recentlyApprovedReview._id },
    {
      $set: {
        createdAt: new Date('2026-01-01T09:00:00.000Z'),
        updatedAt: new Date('2026-01-02T10:00:00.000Z'),
      },
    },
    { timestamps: false }
  );

  const response = await request(app).get('/api/reviews/latest?limit=2').expect(200);

  assert.equal(response.body.length, 2);
  assert.equal(response.body[0]._id, recentlyApprovedReview._id.toString());
  assert.equal(response.body[1]._id, oldReview._id.toString());
});

test('Contact API: stores message and triggers transactional email flow', async () => {
  const response = await request(app)
    .post('/api/contact')
    .send({
      name: 'Jean Dupont',
      email: 'jean.dupont@example.fr',
      subject: 'technique',
      message: 'Bonjour, je rencontre un probleme sur une reservation SailingLoc.',
    })
    .expect(201);

  assert.ok(response.body.id);
  assert.equal(response.body.emailSent, true);
  assert.equal(response.body.emailSkipped, true);

  const message = await ContactMessage.findById(response.body.id);
  assert.equal(message.email, 'jean.dupont@example.fr');
  assert.equal(message.status, 'new');
  assert.equal(message.emailNotification.sent, true);
  assert.equal(message.emailNotification.skipped, true);
});

test('Newsletter API: subscribes a public email and updates existing user consent', async () => {
  const tenant = await createUser({ email: 'newsletter@sailingloc.test', role: 'tenant' });

  const response = await request(app)
    .post('/api/newsletter/subscribe')
    .send({
      email: tenant.email,
      consent: true,
      captchaA: 4,
      captchaB: 6,
      captchaAnswer: 10,
      source: 'test-footer',
    })
    .expect(200);

  assert.equal(response.body.subscriber.email, tenant.email);
  assert.equal(response.body.emailSent, true);
  assert.equal(response.body.emailSkipped, true);

  const subscriber = await NewsletterSubscriber.findOne({ email: tenant.email });
  assert.equal(subscriber.isActive, true);
  assert.equal(subscriber.source, 'test-footer');

  const updatedTenant = await User.findById(tenant._id);
  assert.equal(updatedTenant.marketingConsent, true);
});

test('Users API: reads and updates the profile, then anonymizes the account (RGPD)', async () => {
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const tenantToken = await loginAs(tenant.email);

  const profile = await request(app).get('/api/users/me').set('Authorization', `Bearer ${tenantToken}`).expect(200);
  assert.equal(profile.body.email, tenant.email);
  assert.equal(profile.body.password, undefined);

  const updated = await request(app)
    .put('/api/users/me')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({ firstName: 'Rayen', phone: '+33611111111' })
    .expect(200);
  assert.equal(updated.body.firstName, 'Rayen');
  assert.equal(updated.body.phone, '+33611111111');

  await request(app).delete('/api/users/me').set('Authorization', `Bearer ${tenantToken}`).expect(200);
  const anonymized = await User.findById(tenant._id);
  assert.equal(anonymized.isActive, false);
  assert.match(anonymized.email, /^deleted_user_.+@deleted\.local$/);
  assert.ok(anonymized.anonymizedAt);

  await request(app).get('/api/users/me').set('Authorization', `Bearer ${tenantToken}`).expect(401);
});

test('Notifications API: lists my notifications and marks one as read', async () => {
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const other = await createUser({ email: 'other@sailingloc.test', role: 'tenant' });
  const tenantToken = await loginAs(tenant.email);
  const otherToken = await loginAs(other.email);
  const notification = await Notification.create({
    user: tenant._id,
    type: 'booking_accepted',
    title: 'Reservation acceptee',
    message: 'Votre demande a ete acceptee.',
  });

  const list = await request(app)
    .get('/api/notifications/me')
    .set('Authorization', `Bearer ${tenantToken}`)
    .expect(200);
  assert.equal(list.body.length, 1);

  await request(app)
    .patch(`/api/notifications/${notification._id}/read`)
    .set('Authorization', `Bearer ${otherToken}`)
    .expect(404);

  const read = await request(app)
    .patch(`/api/notifications/${notification._id}/read`)
    .set('Authorization', `Bearer ${tenantToken}`)
    .expect(200);
  assert.ok(read.body.readAt);
});

test('Reports API: a user reports a boat and only the admin can process it', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const admin = await createUser({ email: 'admin@sailingloc.test', role: 'admin' });
  const tenantToken = await loginAs(tenant.email);
  const adminToken = await loginAs(admin.email);
  const boat = await createApprovedBoat(owner._id);

  await request(app)
    .post('/api/reports')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({ targetType: 'boat' })
    .expect(400);

  const created = await request(app)
    .post('/api/reports')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({ targetType: 'boat', targetId: boat._id.toString(), reason: 'Photos trompeuses' })
    .expect(201);
  assert.equal(created.body.status, 'open');

  await request(app).get('/api/reports/admin').set('Authorization', `Bearer ${tenantToken}`).expect(403);

  const list = await request(app).get('/api/reports/admin').set('Authorization', `Bearer ${adminToken}`).expect(200);
  assert.equal(list.body.total, 1);

  await request(app)
    .patch(`/api/reports/admin/${created.body._id}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'inconnu' })
    .expect(400);

  const resolved = await request(app)
    .patch(`/api/reports/admin/${created.body._id}/status`)
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ status: 'resolved', adminNote: 'Annonce corrigee' })
    .expect(200);
  assert.equal(resolved.body.status, 'resolved');
  assert.ok(await AdminActionLog.findOne({ action: 'update_report_status' }));
});

test('Uploads API: owner uploads a boat photo, wrong files and roles are refused', async () => {
  const owner = await createUser({ email: 'owner@sailingloc.test', role: 'owner' });
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const ownerToken = await loginAs(owner.email);
  const tenantToken = await loginAs(tenant.email);
  const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');

  const uploaded = await request(app)
    .post('/api/uploads/boat-images')
    .set('Authorization', `Bearer ${ownerToken}`)
    .attach('file', png, { filename: 'Mon Voilier.png', contentType: 'image/png' })
    .expect(201);
  assert.match(uploaded.body.url, /^\/uploads\/boat-images\/\d+-\d+-mon-voilier\.png$/);
  const uploadedPath = path.join(uploadRoot, uploaded.body.url.replace('/uploads/', ''));
  assert.ok(fs.existsSync(uploadedPath));
  fs.unlinkSync(uploadedPath);

  const wrongType = await request(app)
    .post('/api/uploads/boat-images')
    .set('Authorization', `Bearer ${ownerToken}`)
    .attach('file', Buffer.from('MZ'), { filename: 'virus.exe', contentType: 'application/x-msdownload' })
    .expect(400);
  assert.equal(wrongType.body.message, 'Type de fichier non supporté');

  await request(app).post('/api/uploads/boat-images').set('Authorization', `Bearer ${ownerToken}`).expect(400);

  await request(app)
    .post('/api/uploads/boat-images')
    .set('Authorization', `Bearer ${tenantToken}`)
    .attach('file', png, { filename: 'photo.png', contentType: 'image/png' })
    .expect(403);
});

test('Validation: invalid data is refused with a 400 error', async () => {
  const tenant = await createUser({ email: 'tenant@sailingloc.test', role: 'tenant' });
  const tenantToken = await loginAs(tenant.email);

  await request(app)
    .put('/api/users/me')
    .set('Authorization', `Bearer ${tenantToken}`)
    .send({ firstName: '   ' })
    .expect(400);

  await request(app)
    .patch('/api/notifications/pas-un-identifiant/read')
    .set('Authorization', `Bearer ${tenantToken}`)
    .expect(400);
});

test('slugify creates SEO-safe boat URLs', () => {
  assert.equal(slugify('Évasion Bleue à Marseille !'), 'evasion-bleue-a-marseille');
  assert.equal(slugify('  Bateau---VIP / Côte d’Azur  '), 'bateau-vip-cote-d-azur');
  assert.equal(buildBoatSlug('Hanse 455', 'Vieux Port de Marseille'), 'hanse-455-vieux-port-de-marseille');
});
