const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

//ПУТИ 
const PROJECT_ROOT = __dirname;
const FRONTEND_DIR = path.join(PROJECT_ROOT, 'frontend');
const PUBLIC_DIR = path.join(FRONTEND_DIR, 'public');  
const SRC_DIR = path.join(FRONTEND_DIR, 'src');        

console.log('='.repeat(50));
console.log('Корень проекта:', PROJECT_ROOT);
console.log('Папка frontend:', FRONTEND_DIR);
console.log('Папка public:', PUBLIC_DIR);
console.log('Папка src:', SRC_DIR);
console.log('index.html:', fs.existsSync(path.join(PUBLIC_DIR, 'index.html')));
console.log('app.js:', fs.existsSync(path.join(SRC_DIR, 'app.js')));
console.log('='.repeat(50));

// СТАТИЧЕСКИЕ ФАЙЛЫ 

app.use(express.static(PUBLIC_DIR));

app.use('/src', express.static(SRC_DIR));

// ПРОСТЫЕ API
app.get('/api/test', (req, res) => {
    res.json({
        message: "Сервер работает!",
        timestamp: new Date().toISOString(),
        structure: {
            frontend: FRONTEND_DIR,
            public: PUBLIC_DIR,
            src: SRC_DIR
        }
    });
});

app.get('/api/files', (req, res) => {
    res.json({
        files: [
            { 
                id: 1, 
                filename: "example.txt", 
                size: 1024,
                created_at: new Date().toISOString()
            },
            { 
                id: 2, 
                filename: "photo.jpg", 
                size: 2048000,
                created_at: new Date().toISOString()
            }
        ]
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

const spaRoutes = ['/upload', '/files', '/settings', '/profile'];
spaRoutes.forEach(route => {
    app.get(route, (req, res) => {
        res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
    });
});

// ========== ЗАГРУЗКА ФАЙЛОВ ==========
const multer = require('multer');

// Создаем папку uploads если ее нет
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Создана папка uploads');
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Сохраняем оригинальное имя файла + timestamp
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB максимум
    }
});

// Endpoint для загрузки файла
app.post('/api/upload', upload.single('file'), (req, res) => {
    try {
        console.log('Запрос на загрузку файла');
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Файл не был загружен'
            });
        }
        
        console.log('Файл загружен:', {
            originalname: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype
        });
        
        // Возвращаем информацию о загруженном файле
        res.json({
            success: true,
            message: 'Файл успешно загружен!',
            file: {
                id: Date.now(),
                filename: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                created_at: new Date().toISOString(),
                path: `/uploads/${req.file.filename}`
            }
        });
        
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при загрузке файла: ' + error.message
        });
    }
});

// Раздача загруженных файлов
app.use('/uploads', express.static(uploadsDir));

app.delete('/api/files/:id', (req, res) => {
    try {
        const fileId = req.params.id;
        console.log(`🗑️ Запрос на удаление файла ID: ${fileId}`);
        
        res.json({
            success: true,
            message: `Файл #${fileId} удален`,
            deletedId: fileId
        });
        
    } catch (error) {
        console.error('❌ Ошибка удаления:', error);
        res.status(500).json({
            success: false,
            error: 'Ошибка при удалении файла'
        });
    }
});

// ЗАПУСК 
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`Сервер запущен: http://localhost:${PORT}`);
    console.log(`Главная страница: http://localhost:${PORT}`);
    console.log(`API тест: http://localhost:${PORT}/api/test`);
    console.log(`Проверка файлов:`);
    console.log(`index.html: http://localhost:${PORT}/index.html`);
    console.log(`app.js: http://localhost:${PORT}/src/app.js`);
    console.log(`main.css: http://localhost:${PORT}/src/styles/main.css`);
    console.log('='.repeat(50));
});