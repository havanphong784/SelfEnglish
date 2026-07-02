const admin = require('../config/firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const prisma = require('../config/db');

exports.verifyToken = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'Thiếu idToken' });
    }

    // Xác thực token qua Firebase Admin
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({ error: 'Token không chứa thông tin email' });
    }

    // Kiểm tra xem User đã tồn tại trong CSDL chưa (dựa trên firebaseUid hoặc email)
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { firebaseUid: uid },
          { email: email }
        ]
      }
    });

    if (!user) {
      // Đăng ký mới nếu chưa có
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email: email,
          name: name || email.split('@')[0], // Lấy tên từ Google hoặc username từ email
        }
      });
    } else if (!user.firebaseUid) {
      // Cập nhật firebaseUid nếu user tạo bằng cách khác trước đây
      user = await prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid: uid }
      });
    }

    // Trả về thông tin user
    res.json({
      message: 'Xác thực thành công',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        streak: user.streak,
        targetWeekly: user.targetWeekly
      }
    });

  } catch (error) {
    console.error('Lỗi xác thực Firebase:', error);
    res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};
