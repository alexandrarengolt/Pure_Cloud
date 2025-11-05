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
      
      return data.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.original_name,
        size: file.size,
        mimetype: file.mimetype,
        bucket: file.bucket,
        fileKey: file.file_key, 
        created_at: file.created_at
      }));
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
      
      if (!data) return null;
      
      return {
        id: data.id,
        filename: data.filename,
        originalName: data.original_name, 
        size: data.size,
        mimetype: data.mimetype,
        bucket: data.bucket,
        fileKey: data.file_key, 
        created_at: data.created_at
      };
    } catch (error) {
      console.error('Ошибка поиска файла:', error);
      throw error;
    }
  }

  static async deleteById(id) {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
      throw error;
    }
  }
}

module.exports = File;