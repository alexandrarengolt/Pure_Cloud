const API_BASE = 'http://localhost:5000/api';
// Элементы DOM
const loading = document.querySelector('.loading');
const mainContent = document.getElementById('main-content');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');

// Инициализация приложения
async function initApp() {
    try {
        console.log('Запуск Pure Cloud...');
        
        // Подключение к серверу
        const response = await fetch(API_BASE + '/test');
        if (!response.ok) {
            throw new Error('Сервер не отвечает');
        }
        
        // Загрузка файлов
        await loadFiles();
        
        showMainContent();
        
    } catch (error) {
        showError(error.message);
    }
}

function showMainContent() {
    loading.style.display = 'none';
    mainContent.style.display = 'block';
}

function showError(message) {
    loading.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <p>Ошибка: ${message}</p>
        <button onclick="location.reload()">Повторить</button>
    `;
    console.error('Ошибка:', message);
}

//ФУНКЦИИ РАБОТЫ С ФАЙЛАМИ 

// Загрузка списка файлов
async function loadFiles() {
    try {
        console.log('Загрузка списка файлов...');
        const response = await fetch(API_BASE + '/files');
        const data = await response.json();
        
        if (data.files && Array.isArray(data.files)) {
            displayFiles(data.files);
        } else {
            fileList.innerHTML = '<p>Нет файлов</p>';
        }
    } catch (error) {
        console.error('Ошибка загрузки файлов:', error);
        fileList.innerHTML = '<p>Ошибка загрузки файлов</p>';
    }
}

// Отображение файлов
function displayFiles(files) {
    console.log('Отображаемые файлы:', files);
    
    if (!files || !Array.isArray(files) || files.length === 0) {
        fileList.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">📭 Файлов пока нет</p>';
        return;
    }
    
    let html = '<div class="files-list">';
    
    files.forEach((file, index) => {
        // Безопасное извлечение данных
        const fileName = file.filename || `Файл ${index + 1}`;
        const fileSize = formatFileSize(file.size || 0);
        const fileDate = file.created_at ? 
            new Date(file.created_at).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'Дата неизвестна';
        
        const fileType = file.mimetype || '';
        const fileIcon = getFileIcon(fileType);
        const fileId = file.id || index + 1;
        
        html += `
            <div class="file-item" 
                 data-file-id="${fileId}" 
                 data-file-name="${fileName.replace(/"/g, '&quot;')}"
                 style="
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    margin-bottom: 10px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 1px solid #e9ecef;
                    transition: all 0.3s;
                 ">
                
                <div style="font-size: 28px; color: #4CAF50; margin-right: 15px; min-width: 40px;">
                    <i class="${fileIcon}"></i>
                </div>
                
                <div style="flex-grow: 1;">
                    <div style="font-weight: 600; color: #333; margin-bottom: 5px;">
                        ${fileName}
                    </div>
                    <div style="color: #6c757d; font-size: 14px;">
                        <span style="margin-right: 15px;">📦 ${fileSize}</span>
                        <span>📅 ${fileDate}</span>
                    </div>
                </div>
                
                <div style="display: flex; gap: 8px;">
                    <button class="download-btn" 
                            data-file-id="${fileId}"
                            style="
                                padding: 8px 12px;
                                background: #4CAF50;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 14px;
                                display: flex;
                                align-items: center;
                                gap: 5px;
                            "
                            title="Скачать">
                        <i class="fas fa-download"></i>
                        <span>Скачать</span>
                    </button>
                    
                    <button class="delete-btn" 
                            data-file-id="${fileId}"
                            style="
                                padding: 8px 12px;
                                background: #f44336;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 14px;
                                display: flex;
                                align-items: center;
                                gap: 5px;
                            "
                            title="Удалить">
                        <i class="fas fa-trash"></i>
                        <span>Удалить</span>
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    // Добавляем заголовок
    fileList.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 15px;">
                📁 Мои файлы <small style="color: #6c757d; font-size: 14px;">(${files.length} файлов)</small>
            </h3>
            ${html}
        </div>
    `;
    
    // Добавляем обработчики событий для кнопок
    addFileItemEventListeners();
    
    console.log('✅ Файлы отображены');
}

// Функция для добавления обработчиков событий
function addFileItemEventListeners() {
    // Обработчик для кнопок скачивания
    document.querySelectorAll('.download-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const fileId = this.getAttribute('data-file-id');
            const fileItem = this.closest('.file-item');
            const fileName = fileItem.getAttribute('data-file-name');
            
            console.log('Скачивание файла ID:', fileId);
            downloadFile(fileId, fileName);
        });
    });
    // Обработчик для кнопок удаления
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const fileId = this.getAttribute('data-file-id');
            const fileItem = this.closest('.file-item');
            const fileName = fileItem.getAttribute('data-file-name');
            
            console.log('Удаление файла ID:', fileId);
            deleteFile(fileId, fileName);
        });
    });
    
    // Обработчики для hover-эффектов
    document.querySelectorAll('.file-item').forEach(item => {
        item.addEventListener('mouseover', function() {
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            this.style.transform = 'translateY(-2px)';
        });
        
        item.addEventListener('mouseout', function() {
            this.style.boxShadow = 'none';
            this.style.transform = 'translateY(0)';
        });
    });
}

// Загрузка файла
async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    
    if (!fileInput) {
        alert('Ошибка: поле для загрузки не найдено');
        return;
    }
    
    const files = fileInput.files;
    
    if (files.length === 0) {
        alert('Пожалуйста, выберите файл для загрузки');
        return;
    }
    
    const file = files[0];
    console.log('📤 Загрузка файла:', file.name, file.size, file.type);
    
    // Показываем уведомление о начале загрузки
    const originalButtonText = document.querySelector('button[onclick="uploadFile()"]').innerHTML;
    document.querySelector('button[onclick="uploadFile()"]').innerHTML = 
        '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
    document.querySelector('button[onclick="uploadFile()"]').disabled = true;
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Файл загружен:', result);
            
            alert(`✅ Файл "${file.name}" успешно загружен!`);
            
            // Очищаем input
            fileInput.value = '';
            
            // Обновляем список файлов
            await loadFiles();
            
        } else {
            const errorText = await response.text();
            throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
        }
        
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        alert(`❌ Не удалось загрузить файл: ${error.message}`);
        
    } finally {
        // Восстанавливаем кнопку
        document.querySelector('button[onclick="uploadFile()"]').innerHTML = originalButtonText;
        document.querySelector('button[onclick="uploadFile()"]').disabled = false;
    }
}

// Скачивание файла
async function downloadFile(fileId) {
    try {
        console.log('Скачивание файла ID:', fileId);
        
        const response = await fetch(`${API_BASE}/files/${fileId}/download`);
        const data = await response.json();
        
        if (data.downloadUrl) {
            // Открываем ссылку для скачивания
            window.open(data.downloadUrl, '_blank');
        }
    } catch (error) {
        console.error('Ошибка скачивания:', error);
        alert('Ошибка скачивания файла');
    }
}

// Удаление файла
async function deleteFile(fileId) {
    if (!confirm('Удалить этот файл?')) return;
    
    try {
        console.log('Удаление файла ID:', fileId);
        
        const response = await fetch(`${API_BASE}/files/${fileId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Файл удален');
            await loadFiles(); 
        } else {
            alert('Ошибка удаления');
        }
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка удаления файла');
    }
}

// Форматирование размера файла
function formatFileSize(bytes) {
    if (typeof bytes !== 'number' || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Получение иконки по типу файла
function getFileIcon(mimetype) {
    if (!mimetype) return 'fas fa-file';
    
    if (mimetype.includes('image')) return 'fas fa-file-image';
    if (mimetype.includes('pdf')) return 'fas fa-file-pdf';
    if (mimetype.includes('word') || mimetype.includes('doc')) return 'fas fa-file-word';
    if (mimetype.includes('excel') || mimetype.includes('sheet')) return 'fas fa-file-excel';
    if (mimetype.includes('text') || mimetype.includes('txt')) return 'fas fa-file-alt';
    if (mimetype.includes('video')) return 'fas fa-file-video';
    if (mimetype.includes('audio') || mimetype.includes('mp3')) return 'fas fa-file-audio';
    if (mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('archive')) return 'fas fa-file-archive';
    
    return 'fas fa-file';
}

// Запуск
document.addEventListener('DOMContentLoaded', initApp);

window.uploadFile = uploadFile;
window.downloadFile = downloadFile;
window.deleteFile = deleteFile;
