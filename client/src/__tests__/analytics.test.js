import { describe, expect, test } from 'vitest';
import {
  applyAnalyticsConsent,
  COOKIE_PREFERENCES_KEY,
  hasAnalyticsConsent,
  isGoogleTagManagerLoaded,
  loadGoogleTagManager,
  readCookiePreferences,
} from '../utils/analytics';

const savePreferences = (preferences) => localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));

describe('Cookies et Google Tag Manager (RGPD)', () => {
  test('sans choix de l’utilisateur, Google Tag Manager ne se charge pas', () => {
    applyAnalyticsConsent();
    expect(hasAnalyticsConsent()).toBe(false);
    expect(isGoogleTagManagerLoaded()).toBe(false);
  });

  test('après un refus, Google Tag Manager ne se charge pas', () => {
    savePreferences({ essential: true, analytics: false });
    applyAnalyticsConsent();
    expect(isGoogleTagManagerLoaded()).toBe(false);
  });

  test('après un accord, Google Tag Manager se charge une seule fois', () => {
    savePreferences({ essential: true, analytics: true });
    applyAnalyticsConsent();
    loadGoogleTagManager();
    const scripts = document.querySelectorAll('script#sailingloc-gtm');
    expect(scripts).toHaveLength(1);
    expect(scripts[0].src).toContain('googletagmanager.com/gtm.js?id=');
  });

  test('un choix enregistré illisible est ignoré sans erreur', () => {
    localStorage.setItem(COOKIE_PREFERENCES_KEY, '{pas du json');
    expect(readCookiePreferences()).toBeNull();
    expect(hasAnalyticsConsent()).toBe(false);
  });
});
