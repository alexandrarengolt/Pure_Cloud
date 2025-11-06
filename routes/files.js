const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

//загрузка файла
router.post('/upload', fileController.uploadMiddleware, fileController.uploadFile);

//скачивание файла
router.get('/files/:id/download', fileController.downloadFile);
router.get('/files/:id/direct-download', fileController.directDownload); 

//проверка работоспособности
router.get('/files', fileController.getFiles);
router.get('/test', (req, res) => {
  res.json({ message: 'Файловые маршруты работают!' });
});

//диагностика полей
router.get('/files/:id/debug-fields', fileController.debugFieldConversion);

//удаление файла -
router.delete('/files/:id', fileController.deleteFile);

module.exports = router; 



