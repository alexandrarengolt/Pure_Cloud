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


// скачивание файла через ссылку
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
    
    //получаем файл через модель
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ error: 'Файл не найден в БД' });
    }

    //проверка полей
    if (!file.fileKey) {
      console.log('fileKey отсутствует в объекте');
      return res.status(500).json({ 
        error: 'Отсутствует fileKey',
        file_data: file
      });
    }

    if (!file.bucket) {
      console.log('bucket отсутствует');
      return res.status(500).json({ 
        error: 'Отсутствует bucket',
        file_data: file
      });
    }

    //подготовка параметров
    const s3Params = {
      Bucket: file.bucket,
      Key: file.fileKey
    };

    console.log('ПАРАМЕТРЫ ДЛЯ S3.getObject:');
    console.log('s3Params объект:', JSON.stringify(s3Params, null, 2));
    console.log('Bucket:', s3Params.Bucket);
    console.log('Key:', s3Params.Key);
    console.log('Key тип:', typeof s3Params.Key);
    console.log('Key длина:', s3Params.Key ? s3Params.Key.length : 0);

    //проверка key
    if (!s3Params.Key || s3Params.Key.trim() === '') {
      console.log('КРИТИЧЕСКАЯ ОШИБКА: Key пустой в s3Params');
      return res.status(500).json({
        error: 'Key параметр пустой',
        s3_params: s3Params,
        file_data: file
      });
    }

    console.log('ВЫЗОВ S3.getObject...');
    
    const s3Object = await s3.getObject(s3Params).promise();

    console.log('ФАЙЛ УСПЕШНО ПОЛУЧЕН ИЗ S3');

    res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');
    res.setHeader('Content-Length', file.size);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName || file.filename}"`);
    
    console.log('ОТПРАВКА ФАЙЛА КЛИЕНТУ...');
    
    //отправление файла
    res.send(s3Object.Body);

  } catch (error) {
    console.error('ОШИБКА СКАЧИВАНИЯ:', error);
    console.error('Детали ошибки:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    
    //дополнительная диагностика
    if (error.code === 'MissingRequiredParameter') {
      console.log('ДОПОЛНИТЕЛЬНАЯ ДИАГНОСТИКА ДЛЯ MissingRequiredParameter:');
      const fileId = req.params.id;
      const file = await File.findById(fileId);
      console.log('ПОВТОРНАЯ ПРОВЕРКА ФАЙЛА:', file);
      
      return res.status(500).json({ 
        error: 'S3 параметры не заполнены',
        details: 'Параметр Key не передается в S3',
        debug: {
          fileId: fileId,
          fileKey: file ? file.fileKey : 'file not found',
          bucket: file ? file.bucket : 'file not found'
        }
      });
    }
    
    res.status(500).json({ 
      error: 'Ошибка при скачивании файла',
      details: error.message
    });
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
      Key: file.fileKey
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//диагностика преобразования полей
exports.debugFieldConversion = async (req, res) => {
  try {
    const fileId = req.params.id;
    console.log('ДИАГНОСТИКА ПРЕОБРАЗОВАНИЯ ПОЛЕЙ ДЛЯ ID:', fileId);
    
    const supabase = require('../config/supabase');
    const { data: rawFile, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (error) throw error;
    
    console.log('СЫРЫЕ ДАННЫЕ ИЗ SUPABASE:');
    console.log(JSON.stringify(rawFile, null, 2));

    console.log('ДАННЫЕ ЧЕРЕЗ МОДЕЛЬ File:');
    const modelFile = await File.findById(fileId);
    console.log(JSON.stringify(modelFile, null, 2));

    console.log('СРАВНЕНИЕ:');
    console.log('file_key (Supabase):', rawFile.file_key);
    console.log('fileKey (Model):', modelFile ? modelFile.fileKey : 'UNDEFINED');

    res.json({
      message: 'Диагностика преобразования полей',
      supabase_raw: rawFile,
      model_converted: modelFile,
      comparison: {
        file_key: rawFile.file_key,
        fileKey: modelFile ? modelFile.fileKey : 'UNDEFINED',
        match: rawFile.file_key === (modelFile ? modelFile.fileKey : null)
      }
    });

  } catch (error) {
    console.error('Ошибка диагностики:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.uploadMiddleware = upload;