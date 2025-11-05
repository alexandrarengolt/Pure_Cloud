const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

router.post('/upload', fileController.uploadMiddleware, fileController.uploadFile);

//скачивание файла
router.get('/files/:id/download', fileController.downloadFile);
router.get('/files/:id/direct-download', fileController.directDownload); 

router.get('/files', fileController.getFiles);
router.get('/test', (req, res) => {
  res.json({ message: 'Файловые маршруты работают!' });
});

router.get('/files/:id/debug-fields', fileController.debugFieldConversion);

//удаление файла -
router.delete('/files/:id', fileController.deleteFile);

// router.delete('/api/:id', async (req, res) => {
//   try {
//     const { id } = req.params;

//     await deleteFile(id); 
//     res.status(200).json({ message: 'Файл успешно удален' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

module.exports = router; 



