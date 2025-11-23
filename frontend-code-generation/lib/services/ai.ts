import { api, ApiResponse } from '../api';

// AI聊天相关类型定义
export interface ChatRequest {
  message: string;
  session_id?: string;
  assistant_config_id?: number;
  use_knowledge_base?: boolean;
  agent_id?: number;
}

export interface ChatResponse {
  message: string;
  session_id: string;
  tokens_used: number;
  model: string;
}

export interface ChatMessageResponse {
  id: number;
  user_id: number;
  assistant_config_id?: number;
  session_id: string;
  role: string;
  content: string;
  tokens_used: number;
  model?: string;
  created_at: string;
}

export interface AiTestResponse {
  status: string;
  message?: string;
  details?: any;
}

// 助手配置相关类型定义
export interface AssistantConfig {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  prompt: string;
  model: string;
  temperature: string;
  max_tokens: number;
  top_p: string;
  frequency_penalty: string;
  presence_penalty: string;
  is_default: boolean;
  is_active: boolean;
  icon: string;
  config?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface AssistantConfigCreate {
  name: string;
  description?: string;
  prompt: string;
  model: string;
  temperature: string;
  max_tokens: number;
  top_p: string;
  frequency_penalty: string;
  presence_penalty: string;
  icon: string;
  is_default: boolean;
  is_active: boolean;
  config?: Record<string, any>;
}

export interface AssistantConfigUpdate {
  name?: string;
  description?: string;
  prompt?: string;
  model?: string;
  temperature?: string;
  max_tokens?: number;
  top_p?: string;
  frequency_penalty?: string;
  presence_penalty?: string;
  icon?: string;
  is_default?: boolean;
  is_active?: boolean;
  config?: Record<string, any>;
}

// AI服务类
export class AiService {
  // 发送聊天消息
  async sendMessage(request: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    return api.post<ChatResponse>('/api/ai/chat', request);
  }

  // 获取聊天历史
  async getChatHistory(sessionId: string): Promise<ApiResponse<ChatMessageResponse[]>> {
    return api.get<ChatMessageResponse[]>(`/api/ai/chat/history/${sessionId}`);
  }

  // 获取所有会话
  async getChatSessions(): Promise<ApiResponse<string[]>> {
    return api.get<string[]>('/api/ai/chat/sessions');
  }

  // 测试AI连接
  async testConnection(): Promise<ApiResponse<AiTestResponse>> {
    return api.post<AiTestResponse>('/api/ai/test');
  }

  // 获取可用模型
  async getAvailableModels(): Promise<ApiResponse<string[]>> {
    return api.get<string[]>('/api/ai/models');
  }

  // 助手配置相关方法
  // 创建助手配置
  async createAssistantConfig(config: AssistantConfigCreate): Promise<ApiResponse<AssistantConfig>> {
    return api.post<AssistantConfig>('/api/settings/assistants', config);
  }

  // 获取助手配置列表
  async getAssistantConfigs(skip = 0, limit = 100): Promise<ApiResponse<AssistantConfig[]>> {
    return api.get<AssistantConfig[]>('/api/settings/assistants', { skip, limit });
  }

  // 获取特定助手配置
  async getAssistantConfig(configId: number): Promise<ApiResponse<AssistantConfig>> {
    return api.get<AssistantConfig>(`/api/settings/assistants/${configId}`);
  }

  // 更新助手配置
  async updateAssistantConfig(configId: number, config: AssistantConfigUpdate): Promise<ApiResponse<AssistantConfig>> {
    return api.put<AssistantConfig>(`/api/settings/assistants/${configId}`, config);
  }

  // 删除助手配置
  async deleteAssistantConfig(configId: number): Promise<ApiResponse<{ message: string }>> {
    return api.delete<{ message: string }>(`/api/settings/assistants/${configId}`);
  }

  // 设置默认配置
  async setDefaultConfig(configId: number): Promise<ApiResponse<{ message: string }>> {
    return api.post<{ message: string }>(`/api/settings/assistants/${configId}/set-default`);
  }

  // 生成学习计划
  async generateStudyPlan(prompt: string): Promise<ApiResponse<any>> {
    return api.post<any>('/api/ai/generate-study-plan', { prompt });
  }
}

// 创建AI服务实例
export const aiService = new AiService();

// 导出便捷方法
export const ai = {
  sendMessage: (request: ChatRequest) => aiService.sendMessage(request),
  getChatHistory: (sessionId: string) => aiService.getChatHistory(sessionId),
  getChatSessions: () => aiService.getChatSessions(),
  testConnection: () => aiService.testConnection(),
  getAvailableModels: () => aiService.getAvailableModels(),
  createAssistantConfig: (config: AssistantConfigCreate) => aiService.createAssistantConfig(config),
  getAssistantConfigs: (skip?: number, limit?: number) => aiService.getAssistantConfigs(skip, limit),
  getAssistantConfig: (configId: number) => aiService.getAssistantConfig(configId),
  updateAssistantConfig: (configId: number, config: AssistantConfigUpdate) => aiService.updateAssistantConfig(configId, config),
  deleteAssistantConfig: (configId: number) => aiService.deleteAssistantConfig(configId),
  setDefaultConfig: (configId: number) => aiService.setDefaultConfig(configId),
  generateStudyPlan: (prompt: string) => aiService.generateStudyPlan(prompt),
};