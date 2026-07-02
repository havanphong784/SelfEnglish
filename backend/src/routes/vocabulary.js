const express = require('express');
const router = express.Router();
const vocabularyController = require('../controllers/vocabulary.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Sử dụng authMiddleware cho tất cả các route vocabulary
router.use(authMiddleware);

// Các API liên quan đến Packages
router.get('/packages', vocabularyController.getPackages);
router.get('/packages/:packageId/details', vocabularyController.getPackageDetails);
router.get('/packages/:packageId/learn', vocabularyController.learnPackage);
router.get('/packages/:packageId/practice', vocabularyController.practicePackage);

// Các API liên quan đến Review (Ôn tập)
router.get('/review', vocabularyController.getVocabulariesForReview);
router.post('/:id/review', vocabularyController.updateProgress);
router.post('/:id/master', vocabularyController.masterVocabulary);

// Lịch sử, Lịch trình, Thống kê
router.get('/schedule', vocabularyController.getSchedule);
router.get('/stats', vocabularyController.getStats);

// Random vocabularies
router.get('/random', vocabularyController.getRandomVocabularies);

// Lưu session
router.post('/session', vocabularyController.saveSession);

// API import
router.post('/import', vocabularyController.importVocabularies);

module.exports = router;
