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
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Ошибка поиска файла:', error);
      throw error;
    }
  }
}

module.exports = File;