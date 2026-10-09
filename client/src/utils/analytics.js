// Google Tag Manager n'est chargé qu'après l'accord de l'utilisateur
// (cookies de mesure d'audience), comme promis par le bandeau cookies.

export const COOKIE_PREFERENCES_KEY = 'sailingloc_cookie_preferences';
const GTM_ID = import.meta.env.VITE_GTM_ID || 'GTM-P2TW43Q5';
const GTM_SCRIPT_ID = 'sailingloc-gtm';

export const readCookiePreferences = () => {
  try {
    const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const hasAnalyticsConsent = () => Boolean(readCookiePreferences()?.analytics);

export const isGoogleTagManagerLoaded = () => Boolean(document.getElementById(GTM_SCRIPT_ID));

export const loadGoogleTagManager = () => {
  if (!GTM_ID || isGoogleTagManagerLoaded()) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

  const script = document.createElement('script');
  script.id = GTM_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
  document.head.appendChild(script);
};

// Appelée au démarrage du site : charge GTM seulement si l'utilisateur a déjà accepté.
export const applyAnalyticsConsent = () => {
  if (hasAnalyticsConsent()) loadGoogleTagManager();
};
