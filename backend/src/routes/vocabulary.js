const express = require('express');
const router = express.Router();
const vocabularyController = require('../controllers/vocabulary.controller');

router.get('/', vocabularyController.getVocabularies);
router.post('/', vocabularyController.createVocabulary);
router.post('/import', vocabularyController.importVocabularies);

module.exports = router;
