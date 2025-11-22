import { api } from '@/lib/api'

export interface Agent {
  id: number
  user_id: number
  name: string
  description?: string
  prompt: string
  icon: string
  is_active: boolean
  is_default: boolean
  created_at: string
  updated_at?: string
}

export interface AgentCreate {
  name: string
  description?: string
  prompt: string
  icon?: string
  is_active?: boolean
  is_default?: boolean
}

export interface AgentUpdate {
  name?: string
  description?: string
  prompt?: string
  icon?: string
  is_active?: boolean
  is_default?: boolean
}

// 使用API客户端的ApiResponse接口，避免类型冲突
export interface AgentServiceResponse<T> {
  data?: T
  error?: string
  message?: string
  status: 'success' | 'error'
}

export const agentsService = {
  // 获取用户的Agent列表
  async getAgents(): Promise<AgentServiceResponse<Agent[]>> {
    try {
      console.log('🔍 [Agent服务] 开始获取Agent列表')
      const response = await api.get('/api/agents')
      console.log('📥 [Agent服务] 获取Agent列表响应:', response)
      
      return {
        data: response.data as Agent[],
        status: 'success'
      }
    } catch (error: any) {
      console.error('❌ [Agent服务] 获取Agent列表失败:', error)
      console.error('   🔍 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      return {
        error: error.response?.data?.detail || error.message || '获取Agent列表失败',
        status: 'error'
      }
    }
  },

  // 获取默认Agent
  async getDefaultAgent(): Promise<AgentServiceResponse<Agent>> {
    try {
      console.log('🔍 [Agent服务] 开始获取默认Agent')
      const response = await api.get('/api/agents/default')
      console.log('📥 [Agent服务] 获取默认Agent响应:', response)
      
      return {
        data: response.data as Agent,
        status: 'success'
      }
    } catch (error: any) {
      console.error('❌ [Agent服务] 获取默认Agent失败:', error)
      console.error('   🔍 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      return {
        error: error.response?.data?.detail || error.message || '获取默认Agent失败',
        status: 'error'
      }
    }
  },

  // 创建新Agent
  async createAgent(agentData: AgentCreate): Promise<AgentServiceResponse<Agent>> {
    try {
      console.log('🔍 [Agent服务] 开始创建Agent:', agentData)
      const response = await api.post('/api/agents', agentData)
      console.log('📥 [Agent服务] 创建Agent响应:', response)
      console.log('📦 [Agent服务] 响应数据:', response.data)
      
      return {
        data: response.data as Agent,
        status: 'success'
      }
    } catch (error: any) {
      console.error('❌ [Agent服务] 创建Agent失败:', error)
      console.error('   🔍 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      })
      
      return {
        error: error.response?.data?.detail || error.message || '创建Agent失败',
        status: 'error'
      }
    }
  },

  // 更新Agent
  async updateAgent(id: number, agentData: AgentUpdate): Promise<AgentServiceResponse<Agent>> {
    try {
      console.log('🔍 [Agent服务] 开始更新Agent:', id, agentData)
      const response = await api.put(`/api/agents/${id}`, agentData)
      console.log('📥 [Agent服务] 更新Agent响应:', response)
      
      return {
        data: response.data as Agent,
        status: 'success'
      }
    } catch (error: any) {
      console.error('❌ [Agent服务] 更新Agent失败:', error)
      console.error('   🔍 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      return {
        error: error.response?.data?.detail || error.message || '更新Agent失败',
        status: 'error'
      }
    }
  },

  // 删除Agent
  async deleteAgent(id: number): Promise<AgentServiceResponse<void>> {
    try {
      console.log('🔍 [Agent服务] 开始删除Agent:', id)
      await api.delete(`/api/agents/${id}`)
      console.log('✅ [Agent服务] 删除Agent成功')
      
      return {
        status: 'success'
      }
    } catch (error: any) {
      console.error('❌ [Agent服务] 删除Agent失败:', error)
      console.error('   🔍 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      return {
        error: error.response?.data?.detail || error.message || '删除Agent失败',
        status: 'error'
      }
    }
  },

  // 设置默认Agent
  async setDefaultAgent(id: number): Promise<AgentServiceResponse<Agent>> {
    try {
      console.log('🔍 [Agent服务] 开始设置默认Agent:', id)
      const response = await api.put(`/api/agents/${id}/set-default`)
      console.log('📥 [Agent服务] 设置默认Agent响应:', response)
      
      return {
        data: response.data as Agent,
        status: 'success'
      }
    } catch (error: any) {
      console.error('❌ [Agent服务] 设置默认Agent失败:', error)
      console.error('   🔍 错误详情:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      return {
        error: error.response?.data?.detail || error.message || '设置默认Agent失败',
        status: 'error'
      }
    }
  },

  // 获取特定Agent
  async getAgent(id: number): Promise<AgentServiceResponse<Agent>> {
    try {
      const response = await api.get(`/api/agents/${id}`)
      return {
        data: response.data as Agent,
        status: 'success'
      }
    } catch (error: any) {
      console.error('获取Agent失败:', error)
      return {
        error: error.response?.data?.detail || '获取Agent失败',
        status: 'error'
      }
    }
  }
}