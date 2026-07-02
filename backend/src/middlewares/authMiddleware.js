const { getAuth } = require('firebase-admin/auth');
const prisma = require('../config/db');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Không tìm thấy token xác thực' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Sử dụng getAuth() sẽ dùng default app đã khởi tạo trong firebase-admin.js
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // Tìm user trong DB
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { firebaseUid: decodedToken.uid },
          { email: decodedToken.email }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Người dùng không tồn tại trong CSDL' });
    }

    // Gắn thông tin user vào request để các controller sau sử dụng
    req.user = user;
    next();
  } catch (error) {
    console.error('Lỗi auth middleware:', error);
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

module.exports = verifyFirebaseToken;
