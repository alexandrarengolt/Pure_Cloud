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


// скачивание файла
exports.downloadFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    // Находим файл в БД
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'Файл не найден' });
    }

    //возвращаем signed URL
    const signedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: file.bucket,
      Key: file.fileKey,
      Expires: 3600 // 1 час
    });

    res.json({
      message: 'Ссылка для скачивания готова',
      downloadUrl: signedUrl,
      directDownloadUrl: `/api/files/${fileId}/direct-download`, //добавляем прямую ссылку
      file: {
        id: file.id,
        filename: file.filename,
        size: file.size,
        originalName: file.originalName
      }
    });
  } catch (error) {
    console.error('Ошибка скачивания:', error);
    res.status(500).json({ error: 'Ошибка при скачивании файла' });
  }
};

//прямое скачивание файла
exports.directDownload = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'Файл не найден' });
    }

    // Получаем файл из S3
    const s3Object = await s3.getObject({
      Bucket: file.bucket,
      Key: file.fileKey
    }).promise();

    // Устанавливаем заголовки для скачивания
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Length', file.size);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Отправляем файл
    res.send(s3Object.Body);

  } catch (error) {
    console.error('Ошибка прямого скачивания:', error);
    
    if (error.code === 'NoSuchKey') {
      return res.status(404).json({ error: 'Файл не найден в хранилище' });
    }
    
    res.status(500).json({ error: 'Ошибка при скачивании файла' });
  }
};

//удаление файла
exports.deleteFile = async (req, res) => {
  try {
    const fileId = req.params.id;
    
    //yаходим файл в БД
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'Файл не найден' });
    }

    //удаляем файл из Yandex Cloud
    const s3 = require('../config/s3');
    await s3.deleteObject({
      Bucket: file.bucket,
      Key: file.file_key
    }).promise();

    //удаляем файл из Supabase
    const supabase = require('../config/supabase');
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId);

    if (error) throw error;

    res.json({
      message: 'Файл успешно удален',
      deletedFile: {
        id: file.id,
        filename: file.filename
      }
    });
  } 
  catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.uploadMiddleware = upload;