import { api, Diary, ApiResponse } from '../api';

export interface CreateDiaryRequest {
  title: string;
  content: string;
  mood?: string;
  tags?: string;
  is_private?: boolean;
}

export interface UpdateDiaryRequest {
  title?: string;
  content?: string;
  mood?: string;
  tags?: string;
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
    return api.get<Diary>(`/api/diary/${id}`);
  }

  // 创建日记
  async createDiary(diaryData: CreateDiaryRequest): Promise<ApiResponse<Diary>> {
    return api.post<Diary>('/api/diary', diaryData);
  }

  // 更新日记
  async updateDiary(id: number, diaryData: UpdateDiaryRequest): Promise<ApiResponse<Diary>> {
    return api.put<Diary>(`/api/diary/${id}`, diaryData);
  }

  // 删除日记
  async deleteDiary(id: number): Promise<ApiResponse<void>> {
    return api.delete<void>(`/api/diary/${id}`);
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

  // 导出日记
  async exportDiaries(params?: {
    format?: 'json' | 'csv' | 'pdf';
    start_date?: string;
    end_date?: string;
  }): Promise<ApiResponse<{ download_url: string }>> {
    return api.get<{ download_url: string }>('/api/diary/export', params);
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