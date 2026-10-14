// Adresses des pages du site React (voir client/src/App.jsx).
// Le serveur s'en sert pour répondre 404 à une adresse inconnue au lieu de 200 :
// sinon Google indexe des pages « introuvables » comme de vraies pages (« soft 404 »).
// Un test unitaire vérifie que cette liste reste identique aux routes de App.jsx.
const CLIENT_ROUTE_PATTERNS = [
  '/',
  '/contact',
  '/categories',
  '/products',
  '/products/:id',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password/:token',
  '/boats',
  '/boats/:identifier',
  '/bateaux/:slug',
  '/legal/:slug',
  '/mvp-limitations',
  '/profile',
  '/my-bookings',
  '/payment/success',
  '/payment/cancel',
  '/owner',
  '/owner/dashboard',
  '/owner/boats',
  '/owner/boats/new',
  '/owner/boats/:id/edit',
  '/owner/bookings',
  '/owner/documents',
  '/admin',
  '/admin/dashboard',
  '/admin/users',
  '/admin/boats',
  '/admin/bookings',
  '/admin/reviews',
  '/admin/documents',
  '/admin/payments',
  '/admin/reports',
  '/admin/contact-messages',
  '/admin/email-settings',
  '/admin/action-logs',
];

const toRegExp = (pattern) => new RegExp(`^${pattern.replace(/\/:[^/]+/g, '/[^/]+').replace(/\//g, '\\/')}$`);

const CLIENT_ROUTE_REGEXPS = CLIENT_ROUTE_PATTERNS.map(toRegExp);

const isKnownClientRoute = (pathname = '/') => {
  const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return CLIENT_ROUTE_REGEXPS.some((regexp) => regexp.test(clean));
};

module.exports = { CLIENT_ROUTE_PATTERNS, isKnownClientRoute };
