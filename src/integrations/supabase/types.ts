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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      scan_sessions: {
        Row: {
          birdeye_api_key: string
          created_at: string | null
          current_block: number | null
          error_message: string | null
          helius_rpc_url: string
          id: string
          max_compute_units: number | null
          min_profit_threshold: number | null
          start_date: string
          status: string
          total_blocks: number | null
          updated_at: string | null
        }
        Insert: {
          birdeye_api_key: string
          created_at?: string | null
          current_block?: number | null
          error_message?: string | null
          helius_rpc_url: string
          id?: string
          max_compute_units?: number | null
          min_profit_threshold?: number | null
          start_date: string
          status?: string
          total_blocks?: number | null
          updated_at?: string | null
        }
        Update: {
          birdeye_api_key?: string
          created_at?: string | null
          current_block?: number | null
          error_message?: string | null
          helius_rpc_url?: string
          id?: string
          max_compute_units?: number | null
          min_profit_threshold?: number | null
          start_date?: string
          status?: string
          total_blocks?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      signals: {
        Row: {
          alpha_score: number | null
          atomic_success_lite_svm: boolean | null
          block_time: string | null
          competitor_overlap_count: number | null
          created_at: string | null
          dex_route: string
          explorer_url: string | null
          gap_duration_ms: number | null
          gross_profit: number | null
          historical_age_pool_a_months: number | null
          historical_age_pool_b_months: number | null
          id: string
          instruction_index: number | null
          jito_tip_detected: boolean | null
          latency_buffer_ms: number | null
          margin_fi_liquidity_status: string | null
          net_profit: number | null
          optimal_input: string | null
          price_dex_a: number | null
          price_dex_b: number | null
          priority_fee_99th: number | null
          realism_factor: number | null
          realized_slippage_pct: number | null
          session_id: string | null
          slot: number
          spread_pct: number | null
          token_pair: string
          total_tvl_usd: number | null
          tx_signature_a: string | null
          tx_signature_b: string | null
          verified: boolean | null
          winner_signature: string | null
        }
        Insert: {
          alpha_score?: number | null
          atomic_success_lite_svm?: boolean | null
          block_time?: string | null
          competitor_overlap_count?: number | null
          created_at?: string | null
          dex_route: string
          explorer_url?: string | null
          gap_duration_ms?: number | null
          gross_profit?: number | null
          historical_age_pool_a_months?: number | null
          historical_age_pool_b_months?: number | null
          id?: string
          instruction_index?: number | null
          jito_tip_detected?: boolean | null
          latency_buffer_ms?: number | null
          margin_fi_liquidity_status?: string | null
          net_profit?: number | null
          optimal_input?: string | null
          price_dex_a?: number | null
          price_dex_b?: number | null
          priority_fee_99th?: number | null
          realism_factor?: number | null
          realized_slippage_pct?: number | null
          session_id?: string | null
          slot: number
          spread_pct?: number | null
          token_pair: string
          total_tvl_usd?: number | null
          tx_signature_a?: string | null
          tx_signature_b?: string | null
          verified?: boolean | null
          winner_signature?: string | null
        }
        Update: {
          alpha_score?: number | null
          atomic_success_lite_svm?: boolean | null
          block_time?: string | null
          competitor_overlap_count?: number | null
          created_at?: string | null
          dex_route?: string
          explorer_url?: string | null
          gap_duration_ms?: number | null
          gross_profit?: number | null
          historical_age_pool_a_months?: number | null
          historical_age_pool_b_months?: number | null
          id?: string
          instruction_index?: number | null
          jito_tip_detected?: boolean | null
          latency_buffer_ms?: number | null
          margin_fi_liquidity_status?: string | null
          net_profit?: number | null
          optimal_input?: string | null
          price_dex_a?: number | null
          price_dex_b?: number | null
          priority_fee_99th?: number | null
          realism_factor?: number | null
          realized_slippage_pct?: number | null
          session_id?: string | null
          slot?: number
          spread_pct?: number | null
          token_pair?: string
          total_tvl_usd?: number | null
          tx_signature_a?: string | null
          tx_signature_b?: string | null
          verified?: boolean | null
          winner_signature?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signals_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "scan_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      whitelist: {
        Row: {
          created_at: string | null
          dex: string
          id: string
          liquidity_usd: number
          mint_address: string
          pool_address: string | null
          pool_age_months: number | null
          removed_reason: string | null
          session_id: string | null
          status: string | null
          token_name: string | null
          token_symbol: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dex: string
          id?: string
          liquidity_usd?: number
          mint_address: string
          pool_address?: string | null
          pool_age_months?: number | null
          removed_reason?: string | null
          session_id?: string | null
          status?: string | null
          token_name?: string | null
          token_symbol?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dex?: string
          id?: string
          liquidity_usd?: number
          mint_address?: string
          pool_address?: string | null
          pool_age_months?: number | null
          removed_reason?: string | null
          session_id?: string | null
          status?: string | null
          token_name?: string | null
          token_symbol?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whitelist_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "scan_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
