export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.17" };
  public: {
    Tables: {
      budgets: {
        Row: { category: string; created_at: string; id: string; limit_amount: number; user_id: string };
        Insert: { category: string; created_at?: string; id?: string; limit_amount?: number; user_id?: string };
        Update: { category?: string; created_at?: string; id?: string; limit_amount?: number; user_id?: string };
        Relationships: [];
      };
      goals: {
        Row: { created_at: string; id: string; name: string; saved: number; target: number; user_id: string };
        Insert: { created_at?: string; id?: string; name: string; saved?: number; target?: number; user_id?: string };
        Update: { created_at?: string; id?: string; name?: string; saved?: number; target?: number; user_id?: string };
        Relationships: [];
      };
      login_events: {
        Row: { created_at: string; device: string; email: string; id: string; user_id: string };
        Insert: { created_at?: string; device?: string; email?: string; id?: string; user_id?: string };
        Update: { created_at?: string; device?: string; email?: string; id?: string; user_id?: string };
        Relationships: [];
      };
      notification_settings: {
        Row: { created_at: string; on_budget: boolean; on_incoming: boolean; on_outgoing: boolean; sound_enabled: boolean; user_id: string };
        Insert: { created_at?: string; on_budget?: boolean; on_incoming?: boolean; on_outgoing?: boolean; sound_enabled?: boolean; user_id?: string };
        Update: { created_at?: string; on_budget?: boolean; on_incoming?: boolean; on_outgoing?: boolean; sound_enabled?: boolean; user_id?: string };
        Relationships: [];
      };
      notifications: {
        Row: { body: string; created_at: string; id: string; kind: string; read: boolean; title: string; user_id: string };
        Insert: { body?: string; created_at?: string; id?: string; kind: string; read?: boolean; title: string; user_id?: string };
        Update: { body?: string; created_at?: string; id?: string; kind?: string; read?: boolean; title?: string; user_id?: string };
        Relationships: [];
      };
      payment_templates: {
        Row: { amount: number; created_at: string; iban: string; id: string; name: string; title: string; user_id: string; vs: string | null };
        Insert: { amount?: number; created_at?: string; iban: string; id?: string; name: string; title: string; user_id?: string; vs?: string | null };
        Update: { amount?: number; created_at?: string; iban?: string; id?: string; name?: string; title?: string; user_id?: string; vs?: string | null };
        Relationships: [];
      };
      profiles: {
        Row: { created_at: string; iban: string; id: string; owner: string; seeded: boolean };
        Insert: { created_at?: string; iban?: string; id: string; owner?: string; seeded?: boolean };
        Update: { created_at?: string; iban?: string; id?: string; owner?: string; seeded?: boolean };
        Relationships: [];
      };
      transactions: {
        Row: { amount: number; amount_cents: number; category: string; counterparty: string; created_at: string; date: string; iban: string | null; id: string; idempotency_key: string | null; note: string | null; status: string; type: string; user_id: string; vs: string | null };
        Insert: { amount: number; amount_cents?: number; category?: string; counterparty: string; created_at?: string; date?: string; iban?: string | null; id?: string; idempotency_key?: string | null; note?: string | null; status?: string; type: string; user_id?: string; vs?: string | null };
        Update: { amount?: number; amount_cents?: number; category?: string; counterparty?: string; created_at?: string; date?: string; iban?: string | null; id?: string; idempotency_key?: string | null; note?: string | null; status?: string; type?: string; user_id?: string; vs?: string | null };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      create_payment: {
        Args: { p_amount_cents: number; p_category: string; p_counterparty: string; p_iban: string; p_idempotency_key: string; p_note?: string | null; p_vs?: string | null };
        Returns: Database["public"]["Tables"]["transactions"]["Row"];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof DatabaseWithoutInternals, "public">];
export type Tables<SchemaOrTable extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals }, TableName extends SchemaOrTable extends { schema: keyof DatabaseWithoutInternals } ? keyof (DatabaseWithoutInternals[SchemaOrTable["schema"]]["Tables"] & DatabaseWithoutInternals[SchemaOrTable["schema"]]["Views"]) : never = never> = SchemaOrTable extends { schema: keyof DatabaseWithoutInternals } ? (DatabaseWithoutInternals[SchemaOrTable["schema"]]["Tables"] & DatabaseWithoutInternals[SchemaOrTable["schema"]]["Views"])[TableName] extends { Row: infer Row } ? Row : never : SchemaOrTable extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[SchemaOrTable] extends { Row: infer Row } ? Row : never : never;
export type TablesInsert<SchemaOrTable extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals }, TableName extends SchemaOrTable extends { schema: keyof DatabaseWithoutInternals } ? keyof DatabaseWithoutInternals[SchemaOrTable["schema"]]["Tables"] : never = never> = SchemaOrTable extends { schema: keyof DatabaseWithoutInternals } ? DatabaseWithoutInternals[SchemaOrTable["schema"]]["Tables"][TableName] extends { Insert: infer Insert } ? Insert : never : SchemaOrTable extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][SchemaOrTable] extends { Insert: infer Insert } ? Insert : never;
export type TablesUpdate<SchemaOrTable extends keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals }, TableName extends SchemaOrTable extends { schema: keyof DatabaseWithoutInternals } ? keyof DatabaseWithoutInternals[SchemaOrTable["schema"]]["Tables"] : never = never> = SchemaOrTable extends { schema: keyof DatabaseWithoutInternals } ? DatabaseWithoutInternals[SchemaOrTable["schema"]]["Tables"][TableName] extends { Update: infer Update } ? Update : never : SchemaOrTable extends keyof DefaultSchema["Tables"] ? DefaultSchema["Tables"][SchemaOrTable] extends { Update: infer Update } ? Update : never;
