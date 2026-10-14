import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import i18n from '../i18n';
import BoatCard from '../components/BoatCard';
import StatusBadge from '../components/StatusBadge';

const boat = {
  _id: 'b1',
  slug: 'hanse-455-port-de-nice',
  title: 'Hanse 455',
  type: 'sailboat',
  location: 'Nice',
  port: 'Port de Nice',
  pricePerDay: 250,
  capacity: 8,
  images: ['/images/boats/sailboat/hanse.jpg'],
};

describe('Composants', () => {
  test('le badge de statut affiche le libellé français', () => {
    render(<StatusBadge status="confirmed" />);
    expect(screen.getByText('Confirmé')).toBeInTheDocument();
  });

  test('un statut inconnu est affiché tel quel', () => {
    render(<StatusBadge status="archived" />);
    expect(screen.getByText('archived')).toBeInTheDocument();
  });

  test('la carte bateau mène à la fiche et décrit sa photo pour les lecteurs d’écran', async () => {
    await i18n.changeLanguage('fr');
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <BoatCard boat={boat} />
      </MemoryRouter>
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/boats/hanse-455-port-de-nice');
    expect(screen.getByRole('img', { name: /Hanse 455 à Nice/ })).toBeInTheDocument();
    expect(screen.getByText('Hanse 455')).toBeInTheDocument();
  });
});
