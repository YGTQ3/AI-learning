import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          updated_at?: string
        }
      }
      learning_tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          start_time: string
          end_time: string
          date: string
          completed: boolean
          category: string
          priority: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          start_time: string
          end_time: string
          date: string
          completed?: boolean
          category: string
          priority: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          start_time?: string
          end_time?: string
          date?: string
          completed?: boolean
          category?: string
          priority?: string
          updated_at?: string
        }
      }
      learning_resources: {
        Row: {
          id: string
          user_id: string
          title: string
          category: string
          rating: number
          url?: string
          description?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          category: string
          rating: number
          url?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          category?: string
          rating?: number
          url?: string
          description?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          theme: string
          notifications: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          theme: string
          notifications: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          theme?: string
          notifications?: any
          updated_at?: string
        }
      }
    }
  }
}