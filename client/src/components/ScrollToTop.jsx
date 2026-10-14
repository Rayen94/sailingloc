import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
        return;
      }
    }

    // 'instant' : retour en haut immédiat au changement de page, même si le CSS demande un défilement doux
    // (scroll-behavior: smooth), que Safari n'applique pas toujours.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
