import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './i18n';
import './index.css';
import { applyAnalyticsConsent } from './utils/analytics';

// Google Tag Manager : chargé seulement si l'utilisateur a accepté la mesure d'audience.
applyAnalyticsConsent();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
