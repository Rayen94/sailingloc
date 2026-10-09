const { execFileSync } = require('child_process');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('./src/app');
const connectDB = require('./src/config/db');
const Boat = require('./src/models/Boat');
const User = require('./src/models/User');

const PORT = process.env.PORT || 5000;

// Variables de démonstration : actives par défaut en local, désactivées par défaut en production.
// Sinon, à chaque redémarrage de Render, le mot de passe de l'administrateur était remis à la
// valeur publique « Admin123! », et une base sans bateau validé pouvait être effacée par le seed.
const isProduction = process.env.NODE_ENV === 'production';
const envFlag = (name, defaultValue) =>
  process.env[name] === undefined || process.env[name] === '' ? defaultValue : process.env[name] === 'true';

const runDemoSeedIfNeeded = async () => {
  const forceSeed = envFlag('DEMO_FORCE_SEED', false);
  const seedIfEmpty = envFlag('DEMO_SEED_IF_EMPTY', !isProduction);
  const repairAdmin = envFlag('DEMO_REPAIR_ADMIN', !isProduction);

  if (!forceSeed && !seedIfEmpty && !repairAdmin) return;

  const [demoAdmin, approvedBoatCount] = await Promise.all([
    User.findOne({ email: 'admin@sailingloc.fr' }),
    Boat.countDocuments({ status: 'approved' }),
  ]);
  const adminCredentialsValid =
    demoAdmin && demoAdmin.role === 'admin' && demoAdmin.isActive && (await demoAdmin.matchPassword('Admin123!'));

  if (demoAdmin && !adminCredentialsValid && repairAdmin) {
    demoAdmin.firstName = 'Admin';
    demoAdmin.lastName = 'SailingLoc';
    demoAdmin.role = 'admin';
    demoAdmin.isActive = true;
    demoAdmin.password = 'Admin123!';
    demoAdmin.privacyConsent = true;
    demoAdmin.privacyConsentAt = demoAdmin.privacyConsentAt || new Date();
    await demoAdmin.save();
    console.log('Demo admin repaired: admin@sailingloc.fr / Admin123!');
  }

  const shouldSeed = forceSeed || (seedIfEmpty && (!demoAdmin || approvedBoatCount === 0));
  if (!shouldSeed) {
    console.log(seedIfEmpty ? 'Demo seed skipped: demo admin and approved boats already exist' : 'Demo seed disabled');
    return;
  }

  console.log(forceSeed ? 'Demo seed forced by DEMO_FORCE_SEED=true' : 'Demo seed required: missing demo data');
  execFileSync(process.execPath, [path.join(__dirname, 'src/seed/seed.js')], {
    cwd: __dirname,
    stdio: 'inherit',
    timeout: 180000,
  });
};

connectDB().then(async () => {
  await runDemoSeedIfNeeded();

  app.listen(PORT, () => {
    console.log(`SailingLoc server running on port ${PORT}`);
  });
});
