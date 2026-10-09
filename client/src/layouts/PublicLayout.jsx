import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NewsletterSignup from '../components/NewsletterSignup';
import CookieBanner from '../components/CookieBanner';

const PublicLayout = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Lien d'évitement : au clavier, la touche Tab permet d'aller directement au contenu. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-navy-900 focus:shadow-lg"
      >
        {t('navbar.skipToContent')}
      </a>
      <Header />
      <main id="main-content" role="main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <NewsletterSignup />
      <Footer />
      <CookieBanner />
    </div>
  );
};

export default PublicLayout;
