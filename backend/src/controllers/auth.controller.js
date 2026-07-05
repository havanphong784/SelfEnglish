const { getAuth } = require('firebase-admin/auth');
const firebaseAdminApp = require('../config/firebase-admin');
const prisma = require('../config/db');

exports.verifyToken = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Thieu idToken' });
    }

    if (!firebaseAdminApp) {
      return res.status(503).json({ error: 'Firebase Admin chua duoc cau hinh' });
    }

    const decodedToken = await getAuth(firebaseAdminApp).verifyIdToken(idToken, true);
    const { uid, email, name } = decodedToken;

    if (!email) {
      return res.status(400).json({ error: 'Token khong chua thong tin email' });
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { firebaseUid: uid },
          { email },
        ],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email,
          name: name || email.split('@')[0],
        },
      });
    } else if (!user.firebaseUid) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid: uid },
      });
    } else if (user.firebaseUid !== uid) {
      return res.status(409).json({ error: 'Email nay da duoc lien ket voi tai khoan khac' });
    }

    res.json({
      message: 'Xac thuc thanh cong',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        streak: user.streak,
        targetWeekly: user.targetWeekly,
      },
    });
  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(401).json({ error: 'Token khong hop le hoac da het han' });
  }
};
