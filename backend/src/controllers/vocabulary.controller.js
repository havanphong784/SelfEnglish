const prisma = require('../config/db');

// Lấy danh sách từ vựng
exports.getVocabularies = async (req, res, next) => {
  try {
    const vocabularies = await prisma.vocabulary.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(vocabularies);
  } catch (error) {
    next(error);
  }
};

// Thêm một từ vựng mới
exports.createVocabulary = async (req, res, next) => {
  try {
    const { word, meaning, ipa, example } = req.body;
    
    // Kiểm tra từ đã tồn tại
    const existingWord = await prisma.vocabulary.findUnique({
      where: { word }
    });
    
    if (existingWord) {
      return res.status(400).json({ error: 'Từ vựng đã tồn tại' });
    }

    const newVocab = await prisma.vocabulary.create({
      data: { word, meaning, ipa, example }
    });
    
    res.status(201).json(newVocab);
  } catch (error) {
    next(error);
  }
};

// Import danh sách từ vựng (cho CSV sau này)
exports.importVocabularies = async (req, res, next) => {
  try {
    const { words } = req.body; // Mảng các từ vựng
    if (!words || !Array.isArray(words)) {
      return res.status(400).json({ error: 'Dữ liệu không hợp lệ' });
    }

    const created = await prisma.vocabulary.createMany({
      data: words,
      skipDuplicates: true, // Bỏ qua nếu từ đã tồn tại
    });

    res.json({ message: `Đã import ${created.count} từ vựng mới` });
  } catch (error) {
    next(error);
  }
};
