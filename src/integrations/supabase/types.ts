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
      audit_logs: {
        Row: {
          acao: string
          created_at: string
          descricao: string | null
          id: string
          modulo: string
          user_id: string
          user_nome: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          descricao?: string | null
          id?: string
          modulo: string
          user_id: string
          user_nome?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          descricao?: string | null
          id?: string
          modulo?: string
          user_id?: string
          user_nome?: string | null
        }
        Relationships: []
      }
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
          alergenos: string[]
          ativo: boolean
          badge: string | null
          category_id: string | null
          descricao: string | null
          esgotado: boolean
          id: string
          imagem_url: string | null
          nome: string
          ordem: number
          preco: number | null
          volume: string | null
        }
        Insert: {
          alergenos?: string[]
          ativo?: boolean
          badge?: string | null
          category_id?: string | null
          descricao?: string | null
          esgotado?: boolean
          id?: string
          imagem_url?: string | null
          nome: string
          ordem?: number
          preco?: number | null
          volume?: string | null
        }
        Update: {
          alergenos?: string[]
          ativo?: boolean
          badge?: string | null
          category_id?: string | null
          descricao?: string | null
          esgotado?: boolean
          id?: string
          imagem_url?: string | null
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
          status: string
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
          status?: string
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
          status?: string
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
          funcoes: string | null
          id: string
          ordem: number
          requisitos: string | null
          salario: string | null
          tipo_contrato: string | null
          titulo: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          funcoes?: string | null
          id?: string
          ordem?: number
          requisitos?: string | null
          salario?: string | null
          tipo_contrato?: string | null
          titulo: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          funcoes?: string | null
          id?: string
          ordem?: number
          requisitos?: string | null
          salario?: string | null
          tipo_contrato?: string | null
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
          unit_id: string | null
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
          unit_id?: string | null
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
          unit_id?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          nome: string | null
          role: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          nome?: string | null
          role?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          nome?: string | null
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
          observacoes_internas: string | null
          pessoas: number
          status: Database["public"]["Enums"]["reservation_status"]
          telefone: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data: string
          horario: string
          id?: string
          nome: string
          observacoes?: string | null
          observacoes_internas?: string | null
          pessoas?: number
          status?: Database["public"]["Enums"]["reservation_status"]
          telefone: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data?: string
          horario?: string
          id?: string
          nome?: string
          observacoes?: string | null
          observacoes_internas?: string | null
          pessoas?: number
          status?: Database["public"]["Enums"]["reservation_status"]
          telefone?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
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
          capacidade_por_horario: number | null
          endereco: string
          horarios: string | null
          id: string
          imagem_url: string | null
          maps_url: string | null
          nome: string
          principal: boolean
          telefone: string | null
        }
        Insert: {
          ativo?: boolean
          capacidade_por_horario?: number | null
          endereco: string
          horarios?: string | null
          id?: string
          imagem_url?: string | null
          maps_url?: string | null
          nome: string
          principal?: boolean
          telefone?: string | null
        }
        Update: {
          ativo?: boolean
          capacidade_por_horario?: number | null
          endereco?: string
          horarios?: string | null
          id?: string
          imagem_url?: string | null
          maps_url?: string | null
          nome?: string
          principal?: boolean
          telefone?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          unit_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          unit_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          unit_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_menu_days: {
        Row: {
          ativo: boolean
          dia_semana: string
          id: string
          ordem: number
        }
        Insert: {
          ativo?: boolean
          dia_semana: string
          id?: string
          ordem?: number
        }
        Update: {
          ativo?: boolean
          dia_semana?: string
          id?: string
          ordem?: number
        }
        Relationships: []
      }
      weekly_menu_items: {
        Row: {
          alergenos: string[]
          ativo: boolean
          badge: string | null
          categoria: string | null
          day_id: string | null
          descricao: string | null
          disponivel_ate: string | null
          disponivel_de: string | null
          esgotado: boolean
          id: string
          imagem_url: string | null
          ordem: number
          prato: string
          tags: string[]
          tipo_midia: string
          unit_id: string | null
        }
        Insert: {
          alergenos?: string[]
          ativo?: boolean
          badge?: string | null
          categoria?: string | null
          day_id?: string | null
          descricao?: string | null
          disponivel_ate?: string | null
          disponivel_de?: string | null
          esgotado?: boolean
          id?: string
          imagem_url?: string | null
          ordem?: number
          prato: string
          tags?: string[]
          tipo_midia?: string
          unit_id?: string | null
        }
        Update: {
          alergenos?: string[]
          ativo?: boolean
          badge?: string | null
          categoria?: string | null
          day_id?: string | null
          descricao?: string | null
          disponivel_ate?: string | null
          disponivel_de?: string | null
          esgotado?: boolean
          id?: string
          imagem_url?: string | null
          ordem?: number
          prato?: string
          tags?: string[]
          tipo_midia?: string
          unit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weekly_menu_items_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "weekly_menu_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_menu_items_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      count_reserved_seats: {
        Args: { _data: string; _horario: string; _unit_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor" | "gerente"
      reservation_status:
        | "pendente"
        | "confirmada"
        | "cancelada"
        | "no_show"
        | "concluida"
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
    Enums: {
      app_role: ["admin", "editor", "gerente"],
      reservation_status: [
        "pendente",
        "confirmada",
        "cancelada",
        "no_show",
        "concluida",
      ],
    },
  },
} as const
