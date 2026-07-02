export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string | null; created_at: string };
        Insert: { id: string; display_name?: string | null };
        Update: { display_name?: string | null };
      };
      routines: {
        Row: { id: string; user_id: string; name: string; tag: string | null; created_at: string };
        Insert: { id?: string; user_id: string; name: string; tag?: string | null };
        Update: { name?: string; tag?: string | null };
      };
      routine_exercises: {
        Row: { id: string; routine_id: string; exercise_name: string; target_sets: number | null; target_reps: string | null; position: number };
        Insert: { id?: string; routine_id: string; exercise_name: string; target_sets?: number | null; target_reps?: string | null; position?: number };
        Update: { exercise_name?: string; target_sets?: number | null; target_reps?: string | null; position?: number };
      };
      workout_sessions: {
        Row: { id: string; user_id: string; routine_id: string | null; name: string; started_at: string; finished_at: string | null; notes: string | null };
        Insert: { id?: string; user_id: string; routine_id?: string | null; name: string; started_at?: string; finished_at?: string | null; notes?: string | null };
        Update: { finished_at?: string | null; notes?: string | null };
      };
      session_exercises: {
        Row: { id: string; session_id: string; exercise_name: string; superset_group: string | null; position: number };
        Insert: { id?: string; session_id: string; exercise_name: string; superset_group?: string | null; position?: number };
        Update: { superset_group?: string | null; position?: number };
      };
      session_sets: {
        Row: { id: string; session_exercise_id: string; set_number: number; weight_kg: number | null; reps: number | null; is_pr: boolean; is_dropset: boolean; parent_set_id: string | null; done: boolean; created_at: string };
        Insert: { id?: string; session_exercise_id: string; set_number: number; weight_kg?: number | null; reps?: number | null; is_pr?: boolean; is_dropset?: boolean; parent_set_id?: string | null; done?: boolean };
        Update: { weight_kg?: number | null; reps?: number | null; is_pr?: boolean; done?: boolean };
      };
      goals: {
        Row: { id: string; user_id: string; label: string; exercise_name: string | null; unit: string; target: number; created_at: string };
        Insert: { id?: string; user_id: string; label: string; exercise_name?: string | null; unit: string; target: number };
        Update: { label?: string; target?: number };
      };
      custom_exercises: {
        Row: { id: string; user_id: string; name: string; view: string; highlights: Json; equipment: string | null; instructions: string | null; created_at: string };
        Insert: { id?: string; user_id: string; name: string; view: string; highlights: Json; equipment?: string | null; instructions?: string | null };
        Update: { view?: string; highlights?: Json; equipment?: string | null; instructions?: string | null };
      };
    };
    Views: {
      last_set_per_exercise: {
        Row: { user_id: string | null; exercise_name: string | null; weight_kg: number | null; reps: number | null; finished_at: string | null };
      };
      last_session_sets_per_exercise: {
        Row: { user_id: string | null; exercise_name: string | null; set_number: number | null; weight_kg: number | null; reps: number | null };
      };
      best_weight_per_exercise: {
        Row: { user_id: string | null; exercise_name: string | null; best_weight_kg: number | null };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
