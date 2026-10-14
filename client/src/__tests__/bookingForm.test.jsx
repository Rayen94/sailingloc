import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BookingForm from '../components/BookingForm';

// Le formulaire est testé seul : la connexion et l'appel au serveur sont simulés.
const auth = vi.hoisted(() => ({ user: null }));
const service = vi.hoisted(() => ({ createBooking: vi.fn() }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('../services/bookingService', () => service);

const inDays = (days) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const boat = { _id: 'b1', title: 'Hanse 455', pricePerDay: 250, unavailableDates: [inDays(12)] };

const renderForm = () =>
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <BookingForm boat={boat} />
    </MemoryRouter>
  );

const chooseDates = (start, end) => {
  fireEvent.change(document.getElementById('startDate'), { target: { value: start } });
  fireEvent.change(document.getElementById('endDate'), { target: { value: end } });
};

describe('Formulaire de réservation', () => {
  beforeEach(() => {
    auth.user = null;
    service.createBooking.mockReset();
  });

  test('un visiteur non connecté est invité à se connecter', () => {
    renderForm();
    expect(screen.getByText('Connectez-vous pour réserver ce bateau.')).toBeInTheDocument();
    expect(document.getElementById('startDate')).toBeNull();
  });

  test('un propriétaire ne peut pas réserver', () => {
    auth.user = { role: 'owner' };
    renderForm();
    expect(screen.getByText('Les propriétaires ne peuvent pas réserver.')).toBeInTheDocument();
  });

  test('un locataire voit le prix total puis envoie sa demande', async () => {
    auth.user = { role: 'tenant' };
    service.createBooking.mockResolvedValue({ data: { _id: 'r1' } });
    renderForm();
    chooseDates(inDays(3), inDays(6));
    expect(screen.getByText('Total estimé')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Réserver ce bateau/ }));
    await waitFor(() => expect(screen.getByText('Réservation envoyée !')).toBeInTheDocument());
    expect(service.createBooking).toHaveBeenCalledWith({ boatId: 'b1', startDate: inDays(3), endDate: inDays(6) });
  });

  test('une période avec une date indisponible est refusée sans appeler le serveur', () => {
    auth.user = { role: 'tenant' };
    renderForm();
    chooseDates(inDays(10), inDays(14));
    expect(screen.getByText('Certaines dates de cette période ne sont pas disponibles.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Réserver ce bateau/ })).toBeDisabled();
    expect(service.createBooking).not.toHaveBeenCalled();
  });
});
