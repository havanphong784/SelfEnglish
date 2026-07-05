const express = require('express');
const router = express.Router();
const vocabularyController = require('../controllers/vocabulary.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateRequest');
const vocabularyValidator = require('../validators/vocabulary.validator');

router.use(authMiddleware);

router.get('/packages', vocabularyController.getPackages);
router.get(
  '/packages/:packageId/details',
  validate({ params: vocabularyValidator.packageParam }),
  vocabularyController.getPackageDetails,
);
router.get(
  '/packages/:packageId/learn',
  validate({ params: vocabularyValidator.packageParam }),
  vocabularyController.learnPackage,
);
router.get(
  '/packages/:packageId/practice',
  validate({ params: vocabularyValidator.packageParam }),
  vocabularyController.practicePackage,
);

router.get('/review/count', vocabularyController.getReviewCount);
router.get('/review', vocabularyController.getVocabulariesForReview);
router.post(
  '/:id/review',
  validate({
    params: vocabularyValidator.uuidParam,
    body: vocabularyValidator.reviewBody,
  }),
  vocabularyController.updateProgress,
);
router.post(
  '/:id/master',
  validate({ params: vocabularyValidator.uuidParam }),
  vocabularyController.masterVocabulary,
);

router.get(
  '/schedule',
  validate({ query: vocabularyValidator.scheduleQuery }),
  vocabularyController.getSchedule,
);
router.get('/stats', vocabularyController.getStats);
router.get(
  '/random',
  validate({ query: vocabularyValidator.randomQuery }),
  vocabularyController.getRandomVocabularies,
);
router.post(
  '/session',
  validate({ body: vocabularyValidator.sessionBody }),
  vocabularyController.saveSession,
);
router.post(
  '/import',
  validate({ body: vocabularyValidator.importBody }),
  vocabularyController.importVocabularies,
);

module.exports = router;
