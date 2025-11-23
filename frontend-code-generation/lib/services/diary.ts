import { api, Diary, ApiResponse } from '../api';

export interface CreateDiaryRequest {
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  is_private?: boolean;
}

export interface UpdateDiaryRequest {
  title?: string;
  content?: string;
  mood?: string;
  tags?: string[];
  is_private?: boolean;
}

export interface DiaryListParams {
  page?: number;
  limit?: number;
  mood?: string;
  tags?: string;
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface DiaryListResponse {
  items: Diary[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export class DiaryService {
  // 获取日记列表
  async getDiaries(params?: DiaryListParams): Promise<ApiResponse<Diary[]>> {
    return api.get<Diary[]>('/api/diary', params);
  }

  // 获取单个日记
  async getDiary(id: number): Promise<ApiResponse<Diary>> {
    return api.get<Diary>(`/api/diary/item/${id}`);
  }

  // 创建日记
  async createDiary(diaryData: CreateDiaryRequest): Promise<ApiResponse<Diary>> {
    return api.post<Diary>('/api/diary', diaryData);
  }

  // 更新日记
  async updateDiary(id: number, diaryData: UpdateDiaryRequest): Promise<ApiResponse<Diary>> {
    return api.put<Diary>(`/api/diary/item/${id}`, diaryData);
  }

  // 删除日记
  async deleteDiary(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/api/diary/item/${id}`);
  }

  // 搜索日记
  async searchDiaries(query: string, params?: Omit<DiaryListParams, 'search'>): Promise<ApiResponse<DiaryListResponse>> {
    return api.get<DiaryListResponse>('/api/diary', { ...params, search: query });
  }

  // 获取日记统计信息
  async getDiaryStats(): Promise<ApiResponse<{
    total_diaries: number;
    this_month: number;
    this_week: number;
    mood_distribution: Record<string, number>;
  }>> {
    return api.get('/api/diary/stats');
  }

  // 获取按日期分组的日记
  async getDiariesByDate(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<Record<string, Diary[]>>> {
    return api.get<Record<string, Diary[]>>('/api/diary/by-date', params);
  }

  // 批量删除日记
  async deleteMultipleDiaries(ids: number[]): Promise<ApiResponse<void>> {
    return api.post<void>('/api/diary/batch-delete', { ids });
  }

  // 获取日记标签列表
  async getDiaryTags(): Promise<ApiResponse<string[]>> {
    return api.get<string[]>('/api/diary/tags');
  }

  // 获取心情统计
  async getMoodStats(params?: {
    period?: 'week' | 'month' | 'year';
  }): Promise<ApiResponse<{
    mood: string;
    count: number;
    percentage: number;
  }[]>> {
    return api.get('/api/diary/mood-stats', params);
  }

  // 导出日记
  async exportDiaries(): Promise<void> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('请先登录');
    }

    try {
      console.log('📄 [日记服务] 开始导出日记');
      
      const response = await fetch(`${API_BASE_URL}/api/diary/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`导出失败: ${response.status}`);
      }

      // 获取文件名
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'diaries_export.json';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // 下载文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('✅ [日记服务] 日记导出成功');
      
    } catch (error) {
      console.error('❌ [日记服务] 日记导出失败:', error);
      throw error;
    }
  }

  // 导入日记
  async importDiaries(file: File): Promise<{
    message: string;
    imported_count: number;
    skipped_count: number;
    error_count: number;
    total_processed: number;
  }> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      throw new Error('请先登录');
    }

    try {
      console.log('📄 [日记服务] 开始导入日记');
      console.log('   📁 文件名:', file.name);
      console.log('   📊 文件大小:', file.size, 'bytes');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/diary/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `导入失败: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [日记服务] 日记导入成功:', result);
      
      return result;
      
    } catch (error) {
      console.error('❌ [日记服务] 日记导入失败:', error);
      throw error;
    }
  }
}

// 创建日记服务实例
export const diaryService = new DiaryService();

// 导出便捷方法
export const {
  getDiaries,
  getDiary,
  createDiary,
  updateDiary,
  deleteDiary,
  searchDiaries,
  getDiaryStats,
  getDiariesByDate,
  deleteMultipleDiaries,
  exportDiaries,
  getDiaryTags,
  getMoodStats,
} = diaryService;