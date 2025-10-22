require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./config/supabase');
require('./config/s3');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', require('./routes/files'));

app.get('/', (req, res) => {
  res.json({ 
    message: 'Мое облачное хранилище работает!',
    endpoints: {
      upload: 'POST /api/upload',
      listFiles: 'GET /api/files',
      test: 'GET /api/test'
    }
  });
});

app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  console.log(`API доступно по:`);
  console.log(`   http://localhost:${PORT}/api/upload`);
  console.log(`   http://localhost:${PORT}/api/files`);
});