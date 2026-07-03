const { getAuth } = require('firebase-admin/auth');
const prisma = require('../config/db');
const firebaseAdminApp = require('../config/firebase-admin');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    if (!firebaseAdminApp) {
      return res.status(503).json({ error: 'Firebase Admin chua duoc cau hinh' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Khong tim thay token xac thuc' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth(firebaseAdminApp).verifyIdToken(idToken);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { firebaseUid: decodedToken.uid },
          { email: decodedToken.email },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Nguoi dung khong ton tai trong CSDL' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Token khong hop le hoac da het han' });
  }
};

module.exports = verifyFirebaseToken;
