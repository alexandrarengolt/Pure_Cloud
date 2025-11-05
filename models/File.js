const supabase = require('../config/supabase');

class File {
  static async create(fileData) {
    try {
      const { data, error } = await supabase
        .from('files')
        .insert([
          {
            filename: fileData.filename,
            original_name: fileData.originalName,
            size: fileData.size,
            mimetype: fileData.mimetype,
            bucket: fileData.bucket,
            file_key: fileData.fileKey
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Ошибка создания файла в БД:', error);
      throw error;
    }
  }

  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Ошибка получения файлов:', error);
      throw error;
    }
  }
  static async findById(id) {
  try {
    console.log('🔍 ПОИСК ФАЙЛА ПО ID:', id);
    
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Ошибка Supabase:', error);
      throw error;
    }
    
    if (!data) {
      console.log('❌ Файл не найден в БД');
      return null;
    }

    console.log('✅ ФАЙЛ НАЙДЕН В БД:', {
      id: data.id,
      file_key: data.file_key,
      bucket: data.bucket
    });
    
    // ИСПРАВЛЕННОЕ преобразование - используем fileKey вместо file_key
    const result = {
      id: data.id,
      filename: data.filename,
      originalName: data.original_name, // snake_case -> camelCase
      size: data.size,
      mimetype: data.mimetype,
      bucket: data.bucket,
      fileKey: data.file_key, // ВАЖНО: file_key -> fileKey (camelCase)
      created_at: data.created_at
    };
    
    console.log('🔄 ПРЕОБРАЗОВАННЫЕ ДАННЫЕ:', {
      fileKey: result.fileKey // должно быть files/1762346/06459-photo_2025-08-03_20-20-12.jpg
    });
    
    return result;
  } catch (error) {
    console.error('❌ Ошибка поиска файла:', error);
    throw error;
  }
}

//   static async findById(id) {
//     try {
//       const { data, error } = await supabase
//         .from('files')
//         .select('*')
//         .eq('id', id)
//         .single();

//       if (error) throw error;
//       return data;
//     } catch (error) {
//       console.error('Ошибка поиска файла:', error);
//       throw error;
//     }
//   }
}

module.exports = File;