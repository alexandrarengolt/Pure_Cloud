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
        const response = await fetch(API_BASE + '/');
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

// ========== ФУНКЦИИ РАБОТЫ С ФАЙЛАМИ ==========

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
    if (files.length === 0) {
        fileList.innerHTML = '<p>Файлов пока нет</p>';
        return;
    }
    
    let html = '<div class="files-container">';
    
    files.forEach(file => {
        const size = formatFileSize(file.size);
        const date = new Date(file.created_at || file.uploadDate).toLocaleDateString();
        
        html += `
            <div class="file-item">
                <div class="file-icon">
                    <i class="${getFileIcon(file.mimetype)}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.filename}</div>
                    <div class="file-details">${size} • ${date}</div>
                </div>
                <div class="file-actions">
                    <button class="btn-download" onclick="downloadFile(${file.id})" title="Скачать">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteFile(${file.id})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    fileList.innerHTML = html;
}

// Загрузка файла
async function uploadFile() {
    const files = fileInput.files;
    
    if (files.length === 0) {
        alert('Выберите файл для загрузки');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', files[0]);
    
    try {
        console.log('Загрузка файла:', files[0].name);
        
        const response = await fetch(API_BASE + '/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Файл успешно загружен!');
            fileInput.value = ''; // Очищаем input
            await loadFiles(); // Обновляем список
        } else {
            alert('Ошибка: ' + (result.error || 'Неизвестная ошибка'));
        }
        
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        alert('Ошибка загрузки файла');
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
// Запуск
document.addEventListener('DOMContentLoaded', initApp);

window.uploadFile = uploadFile;
window.downloadFile = downloadFile;
window.deleteFile = deleteFile;
