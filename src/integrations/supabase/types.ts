export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      beverage_categories: {
        Row: {
          ativo: boolean
          id: string
          nome: string
          ordem: number
        }
        Insert: {
          ativo?: boolean
          id?: string
          nome: string
          ordem?: number
        }
        Update: {
          ativo?: boolean
          id?: string
          nome?: string
          ordem?: number
        }
        Relationships: []
      }
      beverages: {
        Row: {
          ativo: boolean
          category_id: string | null
          id: string
          nome: string
          ordem: number
          preco: number | null
          volume: string | null
        }
        Insert: {
          ativo?: boolean
          category_id?: string | null
          id?: string
          nome: string
          ordem?: number
          preco?: number | null
          volume?: string | null
        }
        Update: {
          ativo?: boolean
          category_id?: string | null
          id?: string
          nome?: string
          ordem?: number
          preco?: number | null
          volume?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beverages_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "beverage_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          created_at: string
          curriculo_url: string | null
          disponibilidade: string | null
          email: string
          experiencia: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string
          vaga_id: string | null
        }
        Insert: {
          created_at?: string
          curriculo_url?: string | null
          disponibilidade?: string | null
          email: string
          experiencia?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone: string
          vaga_id?: string | null
        }
        Update: {
          created_at?: string
          curriculo_url?: string | null
          disponibilidade?: string | null
          email?: string
          experiencia?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string
          vaga_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_vaga_id_fkey"
            columns: ["vaga_id"]
            isOneToOne: false
            referencedRelation: "job_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      job_positions: {
        Row: {
          ativa: boolean
          created_at: string
          descricao: string | null
          id: string
          ordem: number
          titulo: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          titulo: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          ordem?: number
          titulo?: string
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          ativo: boolean
          categoria: string
          created_at: string
          descricao: string | null
          destaque: boolean
          id: string
          ordem: number
          tipo: string
          titulo: string
          url: string | null
        }
        Insert: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          descricao?: string | null
          destaque?: boolean
          id?: string
          ordem?: number
          tipo?: string
          titulo: string
          url?: string | null
        }
        Update: {
          ativo?: boolean
          categoria?: string
          created_at?: string
          descricao?: string | null
          destaque?: boolean
          id?: string
          ordem?: number
          tipo?: string
          titulo?: string
          url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string
          data: string
          horario: string
          id: string
          nome: string
          observacoes: string | null
          pessoas: number
          telefone: string
        }
        Insert: {
          created_at?: string
          data: string
          horario: string
          id?: string
          nome: string
          observacoes?: string | null
          pessoas?: number
          telefone: string
        }
        Update: {
          created_at?: string
          data?: string
          horario?: string
          id?: string
          nome?: string
          observacoes?: string | null
          pessoas?: number
          telefone?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          chave: string
          descricao: string
          id: string
          valor: string
        }
        Insert: {
          chave: string
          descricao?: string
          id?: string
          valor?: string
        }
        Update: {
          chave?: string
          descricao?: string
          id?: string
          valor?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          ativo: boolean
          endereco: string
          horarios: string | null
          id: string
          maps_url: string | null
          nome: string
          principal: boolean
          telefone: string | null
        }
        Insert: {
          ativo?: boolean
          endereco: string
          horarios?: string | null
          id?: string
          maps_url?: string | null
          nome: string
          principal?: boolean
          telefone?: string | null
        }
        Update: {
          ativo?: boolean
          endereco?: string
          horarios?: string | null
          id?: string
          maps_url?: string | null
          nome?: string
          principal?: boolean
          telefone?: string | null
        }
        Relationships: []
      }
      weekly_menu_days: {
        Row: {
          dia_semana: string
          id: string
          ordem: number
        }
        Insert: {
          dia_semana: string
          id?: string
          ordem?: number
        }
        Update: {
          dia_semana?: string
          id?: string
          ordem?: number
        }
        Relationships: []
      }
      weekly_menu_items: {
        Row: {
          ativo: boolean
          day_id: string | null
          id: string
          imagem_url: string | null
          ordem: number
          prato: string
          tipo_midia: string
        }
        Insert: {
          ativo?: boolean
          day_id?: string | null
          id?: string
          imagem_url?: string | null
          ordem?: number
          prato: string
          tipo_midia?: string
        }
        Update: {
          ativo?: boolean
          day_id?: string | null
          id?: string
          imagem_url?: string | null
          ordem?: number
          prato?: string
          tipo_midia?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_menu_items_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "weekly_menu_days"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
