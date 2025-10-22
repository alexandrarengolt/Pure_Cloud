const s3 = require('../config/s3');
const File = require('../models/File');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB лимит
  }
}).single('file');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не предоставлен' });
    }

    const fileKey = `files/${Date.now()}-${req.file.originalname}`;

    // Параметры для загрузки в S3
    const params = {
      Bucket: process.env.YANDEX_BUCKET,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'public-read'
    };

    const s3Response = await s3.upload(params).promise();

    const file = await File.create({
      filename: req.file.originalname,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      bucket: process.env.YANDEX_BUCKET,
      fileKey: fileKey
    });

    res.json({
      message: 'Файл успешно загружен!',
      file: {
        id: file.id,
        filename: file.filename,
        size: file.size,
        url: s3Response.Location,
        created_at: file.created_at
      }
    });
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    res.status(500).json({ error: 'Ошибка при загрузке файла' });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const files = await File.findAll();
    res.json({
      message: 'Файлы получены',
      count: files.length,
      files: files
    });
  } catch (error) {
    console.error('Ошибка получения файлов:', error);
    res.status(500).json({ error: 'Ошибка при получении файлов' });
  }
};

exports.uploadMiddleware = upload;