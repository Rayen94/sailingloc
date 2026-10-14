# Configuration SMTP Render - SailingLoc

## État du projet

Le backend SailingLoc contient déjà :

- `nodemailer` ;
- `server/src/utils/mailService.js` ;
- route `POST /api/auth/forgot-password` ;
- route `POST /api/auth/reset-password/:token` ;
- stockage du jeton haché en base ;
- expiration du jeton ;
- page front `/reset-password/:token`.

Il reste à configurer un vrai fournisseur SMTP dans Render.

## Variables Render à renseigner

Dans Render :

`Service` -> `Environment` -> `Add Environment Variable`

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM="SailingLoc <no-reply@sailingloc.fr>"
SMTP_SECURE=false
FRONTEND_URL=https://dsp-dev-o24a-g6-fr.onrender.com
CLIENT_URL=https://dsp-dev-o24a-g6-fr.onrender.com
SERVER_URL=https://dsp-dev-o24a-g6-fr.onrender.com
```

Si le fournisseur utilise le port `465` :

```env
SMTP_PORT=465
SMTP_SECURE=true
```

## Fournisseurs SMTP possibles

Pour une soutenance, choisir un fournisseur simple :

| Fournisseur | Usage |
| --- | --- |
| Brevo | Simple pour SMTP transactionnel |
| Mailtrap | Très pratique pour test sans envoyer à de vrais utilisateurs |
| Gmail App Password | Possible mais moins propre pour un projet professionnel |
| SendGrid | Adapté à la production, configuration un peu plus longue |

## Test manuel

1. Déployer Render après ajout des variables.
2. Ouvrir `/forgot-password`.
3. Saisir un compte existant, par exemple `tenant1@sailingloc.fr`.
4. Vérifier la réception du mail.
5. Cliquer sur le lien `/reset-password/:token`.
6. Changer le mot de passe.
7. Se connecter avec le nouveau mot de passe.

## Test API rapide

```bash
curl -X POST https://dsp-dev-o24a-g6-fr.onrender.com/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"tenant1@sailingloc.fr\"}"
```

Réponse attendue :

```json
{
  "message": "Si un compte existe pour cet email, un lien de réinitialisation sera envoyé."
}
```

## Point de vigilance

La réponse est volontairement générique pour ne pas révéler si un e-mail existe en base.

## Phrase pour la soutenance

> Le système de mot de passe oublié est implémenté de bout en bout. Le jeton n'est jamais stocké en clair, il est haché en base et expire automatiquement. L'envoi réel dépend de la configuration SMTP Render, documentée dans le projet.
