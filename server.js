const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

//Middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Пути 
const PROJECT_ROOT = __dirname;
const FRONTEND_PUBLIC = path.join(PROJECT_ROOT, 'frontend', 'public');


// Статические файлы 
app.use(express.static(FRONTEND_PUBLIC));

// Роуты 
app.use('/api', require('./routes/files'));

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(FRONTEND_PUBLIC, 'index.html'));
});

app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(FRONTEND_PUBLIC, 'index.html'));
});

// Запуск 
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log(`🔗 API тест: http://localhost:${PORT}/api/test`);
    console.log(`🌐 Главная: http://localhost:${PORT}`);
});