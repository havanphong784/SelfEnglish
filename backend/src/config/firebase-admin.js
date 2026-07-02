const { initializeApp, cert } = require('firebase-admin/app');

let app;

try {
  const serviceAccount = require('./serviceAccountKey.json');

  app = initializeApp({
    credential: cert(serviceAccount)
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Lỗi khi nạp serviceAccountKey.json:', error.message);
}

module.exports = app;
