// Database types generated from schema
// Run `supabase gen types typescript` to regenerate

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          credits: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      analyses: {
        Row: {
          id: string;
          user_id: string | null;
          insurance_type: string;
          answers: Json;
          score: number;
          score_label: string;
          insights: Json;
          total_savings_min: number;
          total_savings_max: number;
          is_unlocked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          insurance_type: string;
          answers?: Json;
          score: number;
          score_label: string;
          insights?: Json;
          total_savings_min?: number;
          total_savings_max?: number;
          is_unlocked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          insurance_type?: string;
          answers?: Json;
          score?: number;
          score_label?: string;
          insights?: Json;
          total_savings_min?: number;
          total_savings_max?: number;
          is_unlocked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analyses_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      questionnaire_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          insurance_type: string;
          answers: Json;
          current_question_index: number;
          is_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          insurance_type: string;
          answers?: Json;
          current_question_index?: number;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          insurance_type?: string;
          answers?: Json;
          current_question_index?: number;
          is_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "questionnaire_sessions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: {
          id: string;
          user_id: string | null;
          stripe_session_id: string;
          stripe_payment_intent_id: string | null;
          type: string;
          status: string;
          amount: number;
          currency: string;
          credits_amount: number | null;
          analysis_id: string | null;
          package_id: string | null;
          customer_email: string | null;
          failure_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          stripe_session_id: string;
          stripe_payment_intent_id?: string | null;
          type: string;
          status?: string;
          amount: number;
          currency?: string;
          credits_amount?: number | null;
          analysis_id?: string | null;
          package_id?: string | null;
          customer_email?: string | null;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          stripe_session_id?: string;
          stripe_payment_intent_id?: string | null;
          type?: string;
          status?: string;
          amount?: number;
          currency?: string;
          credits_amount?: number | null;
          analysis_id?: string | null;
          package_id?: string | null;
          customer_email?: string | null;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_analysis_id_fkey";
            columns: ["analysis_id"];
            referencedRelation: "analyses";
            referencedColumns: ["id"];
          }
        ];
      };
      user_settings: {
        Row: {
          user_id: string;
          email_notifications: boolean;
          two_factor_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          email_notifications?: boolean;
          two_factor_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          email_notifications?: boolean;
          two_factor_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_credits: {
        Args: { p_user_id: string; p_amount: number };
        Returns: number;
      };
      use_credit: {
        Args: { p_user_id: string };
        Returns: { success: boolean; remaining: number }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Analysis = Database["public"]["Tables"]["analyses"]["Row"];
export type QuestionnaireSession = Database["public"]["Tables"]["questionnaire_sessions"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type UserSettings = Database["public"]["Tables"]["user_settings"]["Row"];
