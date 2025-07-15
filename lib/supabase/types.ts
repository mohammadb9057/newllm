export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          api_token: string
          tokens_used: number
          tokens_limit: number
          is_admin: boolean
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          api_token?: string
          tokens_used?: number
          tokens_limit?: number
          is_admin?: boolean
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          api_token?: string
          tokens_used?: number
          tokens_limit?: number
          is_admin?: boolean
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      agents: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          system_prompt: string | null
          model_id: string
          memory_type: string
          has_memory: boolean
          is_active: boolean
          settings: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          system_prompt?: string | null
          model_id?: string
          memory_type?: string
          has_memory?: boolean
          is_active?: boolean
          settings?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          system_prompt?: string | null
          model_id?: string
          memory_type?: string
          has_memory?: boolean
          is_active?: boolean
          settings?: any
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          agent_id: string | null
          title: string | null
          model_id: string | null
          is_archived: boolean
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agent_id?: string | null
          title?: string | null
          model_id?: string | null
          is_archived?: boolean
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agent_id?: string | null
          title?: string | null
          model_id?: string | null
          is_archived?: boolean
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: string
          content: string
          model_id: string | null
          tokens: number | null
          metadata: any
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: string
          content: string
          model_id?: string | null
          tokens?: number | null
          metadata?: any
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: string
          content?: string
          model_id?: string | null
          tokens?: number | null
          metadata?: any
          created_at?: string
        }
      }
      agent_memory: {
        Row: {
          id: string
          agent_id: string
          user_id: string
          memory_key: string
          memory_value: string
          memory_type: string
          embedding: number[] | null
          importance_score: number | null
          metadata: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          user_id: string
          memory_key: string
          memory_value: string
          memory_type?: string
          embedding?: number[] | null
          importance_score?: number | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          user_id?: string
          memory_key?: string
          memory_value?: string
          memory_type?: string
          embedding?: number[] | null
          importance_score?: number | null
          metadata?: any
          created_at?: string
          updated_at?: string
        }
      }
      request_logs: {
        Row: {
          id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          endpoint: string
          method: string
          request_body: any | null
          response_body: any | null
          response_status: number | null
          model_id: string | null
          tokens_used: number | null
          processing_time_ms: number | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          endpoint: string
          method?: string
          request_body?: any | null
          response_body?: any | null
          response_status?: number | null
          model_id?: string | null
          tokens_used?: number | null
          processing_time_ms?: number | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          endpoint?: string
          method?: string
          request_body?: any | null
          response_body?: any | null
          response_status?: number | null
          model_id?: string | null
          tokens_used?: number | null
          processing_time_ms?: number | null
          error_message?: string | null
          created_at?: string
        }
      }
      system_config: {
        Row: {
          id: string
          config_key: string
          config_value: any
          description: string | null
          is_public: boolean
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          config_key: string
          config_value: any
          description?: string | null
          is_public?: boolean
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          config_key?: string
          config_value?: any
          description?: string | null
          is_public?: boolean
          updated_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      api_keys: {
        Row: {
          id: string
          user_id: string
          name: string
          key_hash: string
          permissions: any
          last_used_at: string | null
          expires_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          key_hash: string
          permissions?: any
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          key_hash?: string
          permissions?: any
          last_used_at?: string | null
          expires_at?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      usage_analytics: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          event_data: any
          model_id: string | null
          tokens_consumed: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          event_data?: any
          model_id?: string | null
          tokens_consumed?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          event_data?: any
          model_id?: string | null
          tokens_consumed?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      user_stats: {
        Row: {
          id: string
          email: string
          name: string | null
          tokens_used: number
          tokens_limit: number
          is_admin: boolean
          created_at: string
          agent_count: number
          conversation_count: number
          message_count: number
        }
      }
      system_analytics: {
        Row: {
          total_users: number
          total_agents: number
          total_conversations: number
          total_messages: number
          total_tokens_used: number
          avg_tokens_per_user: number
        }
      }
    }
    Functions: {
      get_user_by_api_token: {
        Args: { token: string }
        Returns: Database["public"]["Tables"]["users"]["Row"]
      }
      increment_user_tokens: {
        Args: { user_id: string; tokens: number }
        Returns: boolean
      }
      reset_user_tokens: {
        Args: {}
        Returns: number
      }
    }
  }
}
