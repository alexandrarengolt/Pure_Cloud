const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

router.post('/upload', fileController.uploadMiddleware, fileController.uploadFile);

router.get('/files', fileController.getFiles);
router.get('/test', (req, res) => {
  res.json({ message: 'Файловые маршруты работают!' });
});

module.exports = router;

// Удаление файла
router.delete('/files/:id', fileController.deleteFile);