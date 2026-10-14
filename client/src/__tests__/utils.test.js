import { describe, expect, test } from 'vitest';
import { calculatePrice, isRangeUnavailable } from '../utils/bookingUtils';
import { formatPrice } from '../utils/formatPrice';
import { formatDateInput, formatDateShort } from '../utils/formatDate';
import { buildBoatSlug, slugify } from '../utils/slugifyBoat';

// Les espaces insécables de Intl.NumberFormat sont remplacés par des espaces simples pour comparer.
const plain = (text) => text.replace(/[\u202f\u00a0]/g, ' ');

describe('Prix affiché avant la réservation', () => {
  test('3 jours à 250 € donnent 750 € + 10 % de frais = 825 €', () => {
    expect(calculatePrice('2026-07-01', '2026-07-04', 250)).toEqual({
      numberOfDays: 3,
      subtotal: 750,
      serviceFee: 75,
      totalPrice: 825,
    });
  });

  test('aucun prix si les dates sont incomplètes ou inversées', () => {
    expect(calculatePrice('', '2026-07-04', 250)).toBeNull();
    expect(calculatePrice('2026-07-04', '2026-07-01', 250)).toBeNull();
    expect(calculatePrice('2026-07-04', '2026-07-04', 250)).toBeNull();
  });
});

describe('Dates indisponibles', () => {
  test('une date indisponible dans la période bloque la réservation', () => {
    expect(isRangeUnavailable('2026-07-01', '2026-07-05', ['2026-07-03'])).toBe(true);
  });

  test('le jour du retour peut être le premier jour d’une autre location', () => {
    expect(isRangeUnavailable('2026-07-01', '2026-07-05', ['2026-07-05'])).toBe(false);
    expect(isRangeUnavailable('2026-07-01', '2026-07-05', [])).toBe(false);
  });
});

describe('Formats français', () => {
  test('prix en euros au format français', () => {
    expect(plain(formatPrice(1234.5))).toBe('1 234,50 €');
  });

  test('dates courtes et dates pour les champs de formulaire', () => {
    expect(formatDateShort('2026-10-14T10:00:00Z')).toBe('14/10/2026');
    expect(formatDateInput('2026-10-14T10:00:00Z')).toBe('2026-10-14');
    expect(formatDateShort(null)).toBe('');
  });
});

describe('Adresses des fiches bateaux', () => {
  test('les accents et la ponctuation sont retirés', () => {
    expect(slugify('Évasion Bleue à Marseille !')).toBe('evasion-bleue-a-marseille');
  });

  test('l’adresse contient le titre, le lieu et l’identifiant', () => {
    expect(buildBoatSlug({ _id: 'abc123', title: 'Hanse 455', location: 'Port de Nice' })).toBe(
      'hanse-455-port-de-nice-abc123'
    );
  });
});
