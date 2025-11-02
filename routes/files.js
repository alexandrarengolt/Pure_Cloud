const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

router.post('/upload', fileController.uploadMiddleware, fileController.uploadFile);

router.get('/files', fileController.getFiles);
router.get('/test', (req, res) => {
  res.json({ message: 'Файловые маршруты работают!' });
});

// удаление файла - ДОБАВЬТЕ ЭТО ПЕРЕД module.exports
router.delete('/files/:id', fileController.deleteFile);

// Убедитесь, что есть DELETE маршрут
router.delete('/api/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await deleteFile(id); // Убедитесь, что функция deleteFile существует и импортирована
    res.status(200).json({ message: 'Файл успешно удален' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 