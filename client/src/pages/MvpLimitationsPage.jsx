import SEO from '../components/SEO';
import Breadcrumb from '../components/Breadcrumb';

const sections = [
  {
    title: 'Fonctionnalités réalisées',
    intro: 'Le MVP couvre les parcours principaux attendus pour une démonstration de fin d’année.',
    items: [
      'Catalogue public avec recherche, filtres, fiches bateaux et images par catégorie.',
      'Authentification JWT avec rôles locataire, propriétaire et administrateur.',
      'Parcours de réservation : demande, acceptation par le propriétaire, paiement simulé, annulation et historique.',
      'Espace propriétaire : tableau de bord, annonces, réservations et documents.',
      'Back-office admin : utilisateurs, bateaux, réservations, avis, documents, paiements, signalements et journal d’actions.',
      'Mot de passe oublié avec jeton sécurisé, haché en base et expiration.',
      'Documentation technique, Swagger, Docker, CI, tests API et tests E2E de base.',
    ],
  },
  {
    title: 'Limites assumées du MVP',
    intro: 'Ces points sont volontaires ou dépendent d’une configuration externe pour une production réelle.',
    items: [
      'Le paiement est simulé : aucune transaction bancaire réelle n’est encaissée.',
      'Les fichiers envoyés sont stockés localement ; une production utiliserait un stockage cloud persistant.',
      'L’envoi réel des e-mails dépend des variables configurées sur Render.',
      'La vérification des documents est manuelle, côté administration.',
      'La gestion des litiges existe sous forme de signalements, mais pas encore comme processus d’arbitrage complet.',
      'La sécurité est traitée au niveau MVP et nécessiterait un audit externe avant une exploitation commerciale.',
    ],
  },
  {
    title: 'Évolutions pour la production',
    intro: 'Les prochaines étapes permettent de passer d’un MVP académique à une plateforme commercialisable.',
    items: [
      'Connecter Stripe ou un autre prestataire de paiement avec webhooks et reçus de paiement.',
      'Migrer les images et documents vers S3, Cloudinary, Azure Blob ou équivalent.',
      'Ajouter une messagerie locataire/propriétaire et un processus complet de gestion des litiges.',
      'Générer les contrats de location en PDF et ajouter une signature électronique.',
      'Automatiser les sauvegardes MongoDB, la surveillance de l’application et les alertes de disponibilité.',
      'Compléter les audits Lighthouse, d’accessibilité, de sécurité et de charge avant l’ouverture publique.',
    ],
  },
];

const MvpLimitationsPage = () => (
  <div style={{ background: '#F7F5F2', minHeight: '80vh' }}>
    <SEO title="Limites du MVP | SailingLoc" description="Limites assumées du MVP académique SailingLoc." />
    <div className="container-max section-padding max-w-5xl">
      <Breadcrumb className="site-breadcrumb--card" items={[{ label: 'Limites MVP' }]} />
      <p className="text-xs uppercase font-bold tracking-wider mb-3" style={{ color: '#00AFC8' }}>
        Soutenance
      </p>
      <h1
        className="mb-4"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(32px,5vw,48px)',
          fontWeight: 800,
          color: '#07192E',
        }}
      >
        Périmètre et limites du MVP
      </h1>
      <p className="text-base leading-relaxed mb-8 max-w-3xl" style={{ color: '#64748B' }}>
        Cette page précise ce qui est réalisé, ce qui est simulé pour la démonstration et ce qui resterait à
        industrialiser avant une production commerciale.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {sections.map((section) => (
          <article
            key={section.title}
            className="bg-white rounded-2xl p-6"
            style={{ boxShadow: '0 4px 24px rgba(7,25,46,0.08)' }}
          >
            <h2
              className="text-xl font-bold mb-3"
              style={{ fontFamily: "'Playfair Display', serif", color: '#07192E' }}
            >
              {section.title}
            </h2>
            <p className="text-sm leading-relaxed mb-5" style={{ color: '#64748B' }}>
              {section.intro}
            </p>
            <ul className="space-y-3">
              {section.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed" style={{ color: '#3D4D61' }}>
                  <span className="mt-1.5 h-2 w-2 rounded-full flex-shrink-0" style={{ background: '#00C6E0' }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  </div>
);

export default MvpLimitationsPage;
