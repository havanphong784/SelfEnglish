const fs = require('fs');
const path = require('path');
const { initializeApp, cert, applicationDefault, getApps } = require('firebase-admin/app');
const env = require('./env');

const localServiceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

const getCredential = () => {
  if (env.firebase.serviceAccountJson) {
    return cert(JSON.parse(env.firebase.serviceAccountJson));
  }

  if (env.firebase.projectId && env.firebase.clientEmail && env.firebase.privateKey) {
    return cert({
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey.replace(/\\n/g, '\n'),
    });
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return applicationDefault();
  }

  if (fs.existsSync(localServiceAccountPath)) {
    return cert(require(localServiceAccountPath));
  }

  return null;
};

const credential = getCredential();

const app = getApps().length
  ? getApps()[0]
  : credential
    ? initializeApp({ credential })
    : null;

if (!app) {
  console.warn('Firebase Admin credentials are missing. Auth routes will return 503 until configured.');
}

module.exports = app;
